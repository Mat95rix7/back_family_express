const Person = require('../models/Person');
const { Op } = require('sequelize');
const getAge = require('../utils/getAge')

exports.getHommesMaries = async (req, res) => {
  try {
    // On cherche tous les hommes qui ont un conjointId (donc qui sont mariés)
    const hommesMaries = await Person.findAll({
      where: { 
        conjointId: { [Op.ne]: null },
        gender: 'Homme' // Selon votre modèle
      },
      attributes: ['id', 'first_name', 'last_name', 'birth_date', 'photo', 'conjointId', 'date_deces']
    });

    const hommesMariesWithAge = hommesMaries.map(homme => ({
      ...homme.toJSON(),
      age: getAge(homme.birth_date, homme.date_deces)
    }));
    
    res.json(hommesMariesWithAge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFamilleByHommeMarie = async (req, res) => {
  try {
    const mari = await Person.findByPk(req.params.pereId);
    if (!mari) return res.status(404).json({ error: 'Homme marié non trouvé' });

    // Vérifier qu'il est bien marié
    if (!mari.conjointId) {
      return res.status(400).json({ error: 'Cette personne n\'est pas mariée' });
    }

    // Cherche l'épouse
    const epouse = await Person.findByPk(mari.conjointId);

    // Cherche les enfants - ils peuvent avoir le mari comme père OU l'épouse comme mère
    const enfants = await Person.findAll({
      where: {
        [Op.or]: [
          { fatherId: mari.id },
          { motherId: epouse ? epouse.id : null }
        ]
      }
    });

    // Cherche les grands-parents paternels (parents du mari)
    const grand_pere_paternel = mari.fatherId ? await Person.findByPk(mari.fatherId) : null;
    const grand_mere_paternelle = mari.motherId ? await Person.findByPk(mari.motherId) : null;
    
    // Cherche les grands-parents maternels (parents de l'épouse)
    const grand_pere_maternel = epouse && epouse.fatherId ? await Person.findByPk(epouse.fatherId) : null;
    const grand_mere_maternelle = epouse && epouse.motherId ? await Person.findByPk(epouse.motherId) : null;

    res.json({
      pere: mari ? { ...mari.toJSON(), age: getAge(mari.birth_date, mari.date_deces) } : null,
      mere: epouse ? { ...epouse.toJSON(), age: getAge(epouse.birth_date, epouse.date_deces) } : null,
      enfants: enfants.map(e => ({ ...e.toJSON(), age: getAge(e.birth_date, e.date_deces) })),
      grand_pere_paternel: grand_pere_paternel ? { ...grand_pere_paternel.toJSON(), age: getAge(grand_pere_paternel.birth_date, grand_pere_paternel.date_deces) } : null,
      grand_mere_paternelle: grand_mere_paternelle ? { ...grand_mere_paternelle.toJSON(), age: getAge(grand_mere_paternelle.birth_date, grand_mere_paternelle.date_deces) } : null,
      grand_pere_maternel: grand_pere_maternel ? { ...grand_pere_maternel.toJSON(), age: getAge(grand_pere_maternel.birth_date, grand_pere_maternel.date_deces) } : null,
      grand_mere_maternelle: grand_mere_maternelle ? { ...grand_mere_maternelle.toJSON(), age: getAge(grand_mere_maternelle.birth_date, grand_mere_maternelle.date_deces) } : null,
      is_mari: true, // Toujours vrai puisqu'on filtre sur les hommes mariés
      nb_enfants: enfants.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

