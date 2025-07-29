const Person = require('../models/Person');
const getAge = require('../utils/getAge')
const imagekit = require('../config/imagekit');

exports.getAll = async (req, res) => {
  const personnes = await Person.findAll({
    include: [
      { model: Person, as: 'father', attributes: ['id', 'first_name', 'last_name'] },
      { model: Person, as: 'mother', attributes: ['id', 'first_name', 'last_name'] },
      { model: Person, as: 'conjoint', attributes: ['id', 'first_name', 'last_name'] }
    ]
  });
  const personnesAvecAge = personnes.map(personne => {
      const json = personne.toJSON();
      json.age = getAge(json.birth_date, json.date_deces);
      return json;
    });
  res.json(personnesAvecAge);
};

exports.getOne = async (req, res) => {
  const personne = await Person.findByPk(req.params.id, {
    include: [
      { model: Person, as: 'father', attributes: ['id', 'first_name', 'last_name'] },
      { model: Person, as: 'mother', attributes: ['id', 'first_name', 'last_name'] },
      { model: Person, as: 'conjoint', attributes: ['id', 'first_name', 'last_name'] }
    ]
  });
  if (!personne) return res.status(404).json({ error: 'Personne non trouvée' });
  personne.setDataValue('age', getAge(personne.birth_date, personne.date_deces));
  res.json(personne);
};

exports.create = async (req, res) => {
  try {
    let photoUrl = null;
    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: `${Date.now()}-${req.file.originalname}`,
        folder: "/users"
      });
      photoUrl = result.url;
    }
    
    const data = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      birth_date: req.body.birth_date,
      birth_place: req.body.birth_place,
      fatherId: req.body.fatherId ? Number(req.body.fatherId) : null,
      motherId: req.body.motherId ? Number(req.body.motherId) : null,
      conjointId: req.body.conjointId ? Number(req.body.conjointId) : null,
      date_deces: req.body.date_deces || req.body.dateDeces || null,
      notes: req.body.notes || null,
      photo: photoUrl
    };

    const personne = await Person.create(data);
    // Réciprocité du conjoint
    if (data.conjointId) {
      await Person.update(
        { conjointId: personne.id },
        { where: { id: data.conjointId } }
      );
    }
    res.status(201).json(personne);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {

  try {
    const personne = await Person.findByPk(req.params.id);
    if (!personne) return res.status(404).json({ error: 'Personne non trouvée' });
    let photoUrl = personne.photo;

    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: `${Date.now()}-${req.file.originalname}`,
        folder: "/users"
      });
      photoUrl = result.url;
    }
    const data = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      birth_date: req.body.birth_date,
      birth_place: req.body.birth_place,
      fatherId: req.body.fatherId ? Number(req.body.fatherId) : null,
      motherId: req.body.motherId ? Number(req.body.motherId) : null,
      conjointId: req.body.conjointId ? Number(req.body.conjointId) : null,
      date_deces: req.body.date_deces || req.body.dateDeces || null,
      notes: req.body.notes || null,
      photo: photoUrl
    };
        // Gestion de la réciprocité du conjoint
    if (personne.conjointId && personne.conjointId !== data.conjointId) {
      // On enlève l'ancien conjoint
      await Person.update(
        { conjointId: null },
        { where: { id: personne.conjointId } }
      );
    }
    if (data.conjointId && data.conjointId !== personne.conjointId) {
      // On met à jour le nouveau conjoint
      await Person.update(
        { conjointId: personne.id },
        { where: { id: data.conjointId } }
      );
    }
    await personne.update(data);
    res.json(personne);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const personne = await Person.findByPk(req.params.id);
    if (!personne) return res.status(404).json({ error: 'Personne non trouvée' });
    await personne.destroy();
    res.json({ message: 'Personne supprimée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};