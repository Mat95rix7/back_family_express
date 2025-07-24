const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Person = sequelize.define('Person', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  birth_date: { type: DataTypes.DATEONLY, field: 'birth_date' },
  conjointId: { type: DataTypes.INTEGER, field: 'conjoint_id' },
  birth_place: { type: DataTypes.STRING, field: 'birth_place' },
  photo: { type: DataTypes.STRING },
  fatherId: { type: DataTypes.INTEGER, field: 'father_id' },
  motherId: { type: DataTypes.INTEGER, field: 'mother_id' },
  first_name: { type: DataTypes.STRING, field: 'first_name' },
  last_name: { type: DataTypes.STRING, field: 'last_name' },
  gender: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  date_deces: { type: DataTypes.DATEONLY, field: 'date_deces' }
}, {
  tableName: 'personne',
  timestamps: false
});

Person.belongsTo(Person, { as: 'father', foreignKey: 'fatherId' });
Person.belongsTo(Person, { as: 'mother', foreignKey: 'motherId' });
Person.belongsTo(Person, { as: 'conjoint', foreignKey: 'conjointId' });

module.exports = Person;