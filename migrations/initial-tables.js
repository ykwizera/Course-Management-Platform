'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create managers table
    await queryInterface.createTable('managers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      department: {
        type: Sequelize.STRING
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create facilitators table
    await queryInterface.createTable('facilitators', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      employeeId: {
        type: Sequelize.STRING,
        unique: true
      },
      specialization: {
        type: Sequelize.STRING
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create modules table
    await queryInterface.createTable('modules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      moduleCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      moduleName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      credits: {
        type: Sequelize.INTEGER,
        defaultValue: 3
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 12
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create cohorts table
    await queryInterface.createTable('cohorts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cohortName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      program: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create students table
    await queryInterface.createTable('students', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      studentId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      cohortId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cohorts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      enrollmentDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create classes table
    await queryInterface.createTable('classes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      className: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      semester: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create modes table
    await queryInterface.createTable('modes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      modeName: {
        type: Sequelize.ENUM('Online', 'In-person', 'Hybrid'),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create course_offerings table
    await queryInterface.createTable('course_offerings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      moduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      facilitatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'facilitators',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cohortId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cohorts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      modeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      trimester: {
        type: Sequelize.STRING,
        allowNull: false
      },
      intakePeriod: {
        type: Sequelize.ENUM('HT1', 'HT2', 'FT'),
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      maxStudents: {
        type: Sequelize.INTEGER,
        defaultValue: 30
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'managers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create activity_trackers table
    await queryInterface.createTable('activity_trackers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      allocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'course_offerings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      weekNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      attendance: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      formativeOneGrading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      formativeTwoGrading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      summativeGrading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      courseModeration: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      intranetSync: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      gradeBookStatus: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        defaultValue: 'Not Started'
      },
      submittedAt: {
        type: Sequelize.DATE
      },
      notes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique indexes
    await queryInterface.addIndex('course_offerings', 
      ['moduleId', 'cohortId', 'classId', 'trimester', 'intakePeriod'], 
      { unique: true, name: 'unique_course_offering' }
    );

    await queryInterface.addIndex('activity_trackers', 
      ['allocationId', 'weekNumber'], 
      { unique: true, name: 'unique_activity_tracker' }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity_trackers');
    await queryInterface.dropTable('course_offerings');
    await queryInterface.dropTable('modes');
    await queryInterface.dropTable('classes');
    await queryInterface.dropTable('students');
    await queryInterface.dropTable('cohorts');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('facilitators');
    await queryInterface.dropTable('managers');
  }
};