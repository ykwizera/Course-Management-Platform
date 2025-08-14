const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Insert demo managers
    await queryInterface.bulkInsert('managers', [
      {
        firstName: 'John',
        lastName: 'Manager',
        email: 'john.manager@university.edu',
        password: hashedPassword,
        department: 'Computer Science',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Insert demo facilitators
    await queryInterface.bulkInsert('facilitators', [
      {
        firstName: 'Jane',
        lastName: 'Facilitator',
        email: 'jane.facilitator@university.edu',
        password: hashedPassword,
        employeeId: 'EMP001',
        specialization: 'Web Development',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Insert demo modules
    await queryInterface.bulkInsert('modules', [
      {
        moduleCode: 'CS101',
        moduleName: 'Introduction to Programming',
        description: 'Basic programming concepts and practices',
        credits: 3,
        duration: 12,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Insert demo cohorts
    await queryInterface.bulkInsert('cohorts', [
      {
        cohortName: '2024-CS-Spring',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        program: 'Computer Science',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Insert demo classes
    await queryInterface.bulkInsert('classes', [
      {
        className: '2024S',
        year: 2024,
        semester: 'S',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Insert demo modes
    await queryInterface.bulkInsert('modes', [
      {
        modeName: 'Online',
        description: 'Fully online delivery',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        modeName: 'In-person',
        description: 'Face-to-face delivery',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        modeName: 'Hybrid',
        description: 'Mixed online and in-person delivery',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('modes', null, {});
    await queryInterface.bulkDelete('classes', null, {});
    await queryInterface.bulkDelete('cohorts', null, {});
    await queryInterface.bulkDelete('modules', null, {});
    await queryInterface.bulkDelete('facilitators', null, {});
    await queryInterface.bulkDelete('managers', null, {});
  }
};