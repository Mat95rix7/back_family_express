// routes/admin.js
const express = require('express');
const User = require('../models/User');
const Person = require('../models/Person');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

const { QueryTypes } = require('sequelize'); // Important !

// Statistiques générales
exports.stats = async (req, res) => {
  try {
    const [userStats, personStats] = await Promise.all([
      User.findAll({
        attributes: [
          'role',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['role']
      }),
      Person.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalPersons'],
          [sequelize.fn('COUNT', sequelize.col('date_deces')), 'deceased'],
          [sequelize.literal('AVG(YEAR(CURDATE()) - YEAR(birth_date))'), 'averageAge']
        ]
      })
    ]);

    const genderStats = await Person.findAll({
      attributes: [
        'gender',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['gender']
    });


    const birthDecades = await sequelize.query(`
      SELECT 
        decade,
        COUNT(*) AS count
      FROM (
        SELECT 
          FLOOR(YEAR(birth_date)/10)*10 AS decade
        FROM personne
        WHERE birth_date IS NOT NULL
      ) AS sub
      GROUP BY decade
      ORDER BY decade
    `, { type: QueryTypes.SELECT });

    res.json({
      users: userStats,
      persons: personStats[0]?.dataValues || { totalPersons: 0, deceased: 0, averageAge: 0 },
      genderDistribution: genderStats,
      birthDecades
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: error.message });
  }
};

// Liste des utilisateurs avec pagination

exports.users = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereClause = search ? {
      [Op.or]: [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']]
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher de se retirer les droits admin
    if (user.id === req.userId && role !== 'admin') {
      return res.status(400).json({ error: 'Vous ne pouvez pas retirer vos propres droits admin' });
    }

    await user.update({ username, email, role, isActive });
    
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher de se supprimer soi-même
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role = 'user', isActive = true } = req.body;

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hash,
      role,
      isActive
    });

    const newUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


