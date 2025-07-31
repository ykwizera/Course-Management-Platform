const { 
  CourseOffering, 
  Module, 
  Facilitator, 
  Cohort, 
  Class, 
  Mode, 
  User 
} = require('../../models');
const { sequelize } = require('../../models');

describe('CourseOffering Model', () => {
  let testModule, testFacilitator, testCohort, testClass, testMode, testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up all tables
    await CourseOffering.destroy({ where: {}, force: true });
    await Module.destroy({ where: {}, force: true });
    await Facilitator.destroy({ where: {}, force: true });
    await Cohort.destroy({ where: {}, force: true });
    await Class.destroy({ where: {}, force: true });
    await Mode.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    // Create test user
    testUser = await User.create({
      email: 'facilitator@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Facilitator',
      role: 'facilitator'
    });

    // Create test data
    testModule = await Module.create({
      code: 'CS101',
      name: 'Introduction to Computer Science',
      description: 'Basic programming concepts',
      credits: 3,
      duration: 12
    });

    testFacilitator = await Facilitator.create({
      userId: testUser.id,
      employeeId: 'EMP001',
      department: 'Computer Science'
    });

    testCohort = await Cohort.create({
      name: 'Cohort 2024A',
      description: 'Spring 2024 cohort',
      startDate: '2024-01-15',
      endDate: '2024-05-15',
      maxStudents: 30
    });

    testClass = await Class.create({
      code: '2024S',
      name: 'Spring 2024',
      year: 2024,
      trimester: '1'
    });

    testMode = await Mode.create({
      name: 'online',
      description: 'Online delivery mode'
    });
  });

  describe('CourseOffering Creation', () => {
    test('should create a course offering with valid data', async () => {
      const offeringData = {
        moduleId: testModule.id,
        facilitatorId: testFacilitator.id,
        cohortId: testCohort.id,
        classId: testClass.id,
        modeId: testMode.id,
        intakePeriod: 'HT1',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        maxStudents: 25
      };

      const offering = await CourseOffering.create(offeringData);

      expect(offering.id).toBeDefined();
      expect(offering.moduleId).toBe(testModule.id);
      expect(offering.facilitatorId).toBe(testFacilitator.id);
      expect(offering.cohortId).toBe(testCohort.id);
      expect(offering.classId).toBe(testClass.id);
      expect(offering.modeId).toBe(testMode.id);
      expect(offering.intakePeriod).toBe('HT1');
      expect(offering.status).toBe('planned'); // Default status
      expect(offering.maxStudents).toBe(25);
    });

    test('should validate required fields', async () => {
      const incompleteData = {
        moduleId: testModule.id,
        facilitatorId: testFacilitator.id
        // Missing required fields
      };

      await expect(CourseOffering.create(incompleteData)).rejects.toThrow();
    });

    test('should validate foreign key constraints', async () => {
      const invalidData = {
        moduleId: '550e8400-e29b-41d4-a716-446655440000', // Non-existent UUID
        facilitatorId: testFacilitator.id,
        cohortId: testCohort.id,
        classId: testClass.id,
        modeId: testMode.id,
        intakePeriod: 'HT1',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        maxStudents: 25
      };

      await expect(CourseOffering.create(invalidData)).rejects.toThrow();
    });

    test('should validate intake period enum', async () => {
      const invalidIntakeData = {
        moduleId: testModule.id,
        facilitatorId: testFacilitator.id,
        cohortId: testCohort.id,
        classId: testClass.id,
        modeId: testMode.id,
        intakePeriod: 'INVALID',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        maxStudents: 25
      };

      await expect(CourseOffering.create(invalidIntakeData)).rejects.toThrow();
    });

    test('should validate maxStudents minimum value', async () => {
      const invalidMaxStudents = {
        moduleId: testModule.id,
        facilitatorId: testFacilitator.id,
        cohortId: testCohort.id,
        classId: testClass.id,
        modeId: testMode.id,
        intakePeriod: 'HT1',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        maxStudents: 0
      };

      await expect(CourseOffering.create(invalidMaxStudents)).rejects.toThrow();
    });

    test('should validate status enum', async () => {
      const validData = {
        moduleId: testModule.id,
        facilitatorId: testFacilitator.id,
        cohortId: testCohort.id,
        classId: testClass.id,
        modeId: testMode.id,
        intakePeriod: 'HT1',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        maxStudents: 25,
        status: 'active'
      };

      const offering = await CourseOffering.create(validData);
      expect(offering.status).toBe('active');

      const invalidStatusData = { ...validData, status: 'invalid_status' };
      await expect(CourseOffering.create(invalidStatusData)).rejects.toThrow();
    });
  });

  describe('CourseOffering Associations', () => {
    let courseOffering;

    beforeEach(async () => {
      courseOffering = await CourseOffering.create({
        moduleId: testModule.id,
        facilitatorId: testFacilitator.id,
        cohortId: testCohort.id,
        classId: testClass.id,
        modeId: testMode.id,
        intakePeriod: 'HT1',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        maxStudents: 25
      });
    });

    test('should load module association', async () => {
      const offeringWithModule = await CourseOffering.findByPk(courseOffering.id, {
        include: [{ model: Module, as: 'module' }]
      });

      expect(offeringWithModule.module).toBeDefined();
      expect(offeringWithModule.module.code).toBe('CS101');
      expect(offeringWithModule.module.name).toBe('Introduction to Computer Science');
    });

    test('should load facilitator association with user', async () => {
      const offeringWithFacilitator = await CourseOffering.findByPk(courseOffering.id, {
        include: [{
          model: Facilitator,
          as: 'facilitator',
          include: [{ model: User, as: 'user' }]
        }]
      });

      expect(offeringWithFacilitator.facilitator).toBeDefined();
      expect(offeringWithFacilitator.facilitator.employeeId).toBe('EMP001');
      expect(offeringWithFacilitator.facilitator.user.firstName).toBe('John');
    });

    test('should load cohort association', async () => {
      const offeringWithCohort = await CourseOffering.findByPk(courseOffering.id, {
        include: [{ model: Cohort, as: 'cohort' }]
      });

      expect(offeringWithCohort.cohort).toBeDefined();
      expect(offeringWithCohort.cohort.name).toBe('Cohort 2024A');
    });

    test('should load class association', async () => {
      const offeringWithClass = await CourseOffering.findByPk(courseOffering.id, {
        include: [{ model: Class, as: 'class' }]
      });

      expect(offeringWithClass.class).toBeDefined();
      expect(offeringWithClass.class.code).toBe('2024S');
      expect(offeringWithClass.class.year).toBe(2024);
    });

    test('should load mode association', async () => {
      const offeringWithMode = await CourseOffering.findByPk(courseOffering.id, {
        include: [{ model: Mode, as: 'mode' }]
      });

      expect(offeringWithMode.mode).toBeDefined();
      expect(offeringWithMode.mode.name).toBe('online');
    });

    test('should load all associations together', async () => {
      const fullOffering = await CourseOffering.findByPk(courseOffering.id, {
        include: [
          { model: Module, as: 'module' },
          { 
            model: Facilitator, 
            as: 'facilitator',
            include: [{ model: User, as: 'user' }]
          },
          { model: Cohort, as: 'cohort' },
          { model: Class, as: 'class' },
          { model: Mode, as: 'mode' }
        ]
      });

      expect(fullOffering.module).toBeDefined();
      expect(fullOffering.facilitator).toBeDefined();
      expect(fullOffering.facilitator.user).toBeDefined();
      expect(fullOffering.cohort).toBeDefined();
      expect(fullOffering.class).toBeDefined();
      expect(fullOffering.mode).toBeDefined();
    });
  });

  describe('CourseOffering Updates', () => {
    let courseOffering;

    beforeEach(async () => {
      courseOffering = await CourseOffering.create({
        moduleId: testModule.id,
        facilitatorId: testFacilitator.id,
        cohortId: testCohort.id,
        classId: testClass.id,
        modeId: testMode.id,
        intakePeriod: 'HT1',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        maxStudents: 25
      });
    });

    test('should update course offering status', async () => {
      await courseOffering.update({ status: 'active' });
      expect(courseOffering.status).toBe('active');

      await courseOffering.update({ status: 'completed' });
      expect(courseOffering.status).toBe('completed');
    });

    test('should update max students', async () => {
      await courseOffering.update({ maxStudents: 30 });
      expect(courseOffering.maxStudents).toBe(30);
    });

    test('should update notes', async () => {
      const notes = 'Updated course notes';
      await courseOffering.update({ notes });
      expect(courseOffering.notes).toBe(notes);
    });

    test('should update multiple fields', async () => {
      const updates = {
        status: 'active',
        maxStudents: 35,
        notes: 'Course is now active with increased capacity'
      };

      await courseOffering.update(updates);
      
      expect(courseOffering.status).toBe('active');
      expect(courseOffering.maxStudents).toBe(35);
      expect(courseOffering.notes).toBe(updates.notes);
    });
  });

  describe('CourseOffering Queries', () => {
    beforeEach(async () => {
      // Create additional test data for querying
      const anotherModule = await Module.create({
        code: 'CS102',
        name: 'Advanced Programming',
        credits: 4,
        duration: 14
      });

      const anotherMode = await Mode.create({
        name: 'in-person',
        description: 'In-person delivery mode'
      });

      await CourseOffering.bulkCreate([
        {
          moduleId: testModule.id,
          facilitatorId: testFacilitator.id,
          cohortId: testCohort.id,
          classId: testClass.id,
          modeId: testMode.id,
          intakePeriod: 'HT1',
          startDate: '2024-02-01',
          endDate: '2024-05-01',
          maxStudents: 25,
          status: 'planned'
        },
        {
          moduleId: anotherModule.id,
          facilitatorId: testFacilitator.id,
          cohortId: testCohort.id,
          classId: testClass.id,
          modeId: anotherMode.id,
          intakePeriod: 'HT2',
          startDate: '2024-03-01',
          endDate: '2024-06-01',
          maxStudents: 20,
          status: 'active'
        }
      ]);
    });

    test('should find offerings by facilitator', async () => {
      const offerings = await CourseOffering.findAll({
        where: { facilitatorId: testFacilitator.id }
      });

      expect(offerings).toHaveLength(2);
    });

    test('should find offerings by status', async () => {
      const plannedOfferings = await CourseOffering.findAll({
        where: { status: 'planned' }
      });

      const activeOfferings = await CourseOffering.findAll({
        where: { status: 'active' }
      });

      expect(plannedOfferings).toHaveLength(1);
      expect(activeOfferings).toHaveLength(1);
    });

    test('should find offerings by intake period', async () => {
      const ht1Offerings = await CourseOffering.findAll({
        where: { intakePeriod: 'HT1' }
      });

      const ht2Offerings = await CourseOffering.findAll({
        where: { intakePeriod: 'HT2' }
      });

      expect(ht1Offerings).toHaveLength(1);
      expect(ht2Offerings).toHaveLength(1);
    });

    test('should find offerings with complex filtering', async () => {
      const offerings = await CourseOffering.findAll({
        where: {
          facilitatorId: testFacilitator.id,
          status: 'planned',
          intakePeriod: 'HT1'
        },
        include: [
          { model: Module, as: 'module' },
          { model: Mode, as: 'mode' }
        ]
      });

      expect(offerings).toHaveLength(1);
      expect(offerings[0].module.code).toBe('CS101');
      expect(offerings[0].mode.name).toBe('online');
    });
  });

  describe('CourseOffering Deletion', () => {
    test('should soft delete course offering', async () => {
      const offering = await CourseOffering.create({
        moduleId: testModule.id,
        facilitatorId: testFacilitator.id,
        cohortId: testCohort.id,
        classId: testClass.id,
        modeId: testMode.id,
        intakePeriod: 'HT1',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        maxStudents: 25
      });

      await offering.destroy();

      const deletedOffering = await CourseOffering.findByPk(offering.id);
      expect(deletedOffering).toBeNull();

      const deletedOfferingWithParanoid = await CourseOffering.findByPk(offering.id, {
        paranoid: false
      });
      expect(deletedOfferingWithParanoid).toBeDefined();
      expect(deletedOfferingWithParanoid.deletedAt).toBeDefined();
    });
  });
});
