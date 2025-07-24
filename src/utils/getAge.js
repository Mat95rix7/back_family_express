function getAge(birthDate, dateDeces = null) {
    if (!birthDate) return null;
    const endDate = dateDeces ? new Date(dateDeces) : new Date();
    const birth = new Date(birthDate);
    let age = endDate.getFullYear() - birth.getFullYear();
    const m = endDate.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  
  module.exports = getAge;