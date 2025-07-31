const { 
  ActivityTracker, 
  CourseOffering,
  Module,
  Facilitator,
  Cohort,
  Class,
  Mode,
  User 
} = require('../../models');
const { sequelize } = require('../../models');

describe('ActivityTracker Model', () => {
  let testCourseOffering, testFacilitator, testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up all tables
    await ActivityTracker.destroy({ where: {}, force: true });
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

    // Create test facilitator
    testFacilitator = await Facilitator.create({
      userId: testUser.id,
      employeeId: 'EMP001',
      department: 'Computer Science'
    });

    // Create required entities for course offering
    const testModule = await Module.create({
      code: 'CS101',
      name: 'Introduction to Computer Science',
      credits: 3,
      duration: 12
    });

    const testCohort = await Cohort.create({
      name: 'Cohort 2024A',
      startDate: '2024-01-15',
      endDate: '2024-05-15',
      maxStudents: 30
    });

    const testClass = await Class.create({
      code: '2024S',
      name: 'Spring 2024',
      year: 2024,
      trimester: '1'
    });

    const testMode = await Mode.create({
      name: 'online',
      description: 'Online delivery mode'
    });

    // Create test course offering
    testCourseOffering = await CourseOffering.create({
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

  describe('ActivityTracker Creation', () => {
    test('should create activity tracker with valid data', async () => {
      const trackerData = {
        allocationId: testCourseOffering.id,
        facilitatorId: testFacilitator.id,
        weekNumber: 1,
        weekStartDate: '2024-02-05',
        weekEndDate: '2024-02-11'
      };

      const tracker = await ActivityTracker.create(trackerData);

      expect(tracker.id).toBeDefined();
      expect(tracker.allocationId).toBe(testCourseOffering.id);
      expect(tracker.facilitatorId).toBe(testFacilitator.id);
      expect(tracker.weekNumber).toBe(1);
      expect(tracker.formativeOneGrading).toBe('Not Started');
      expect(tracker.formativeTwoGrading).toBe('Not Started');
      expect(tracker.summativeGrading).toBe('Not Started');
      expect(tracker.courseModeration).toBe('Not Started');
      expect(tracker.intranetSync).toBe('Not Started');
      expect(tracker.gradeBookStatus).toBe('Not Started');
      expect(tracker.attendance).toEqual([]);
    });

    test('should validate required fields', async () => {
      const incompleteData = {
        allocationId: testCourseOffering.id,
        weekNumber: 1
        // Missing required fields
      };

      await expect(ActivityTracker.create(incompleteData)).rejects.toThrow();
    });

    test('should validate week number range', async () => {
      const invalidWeekData = {
        allocationId: testCourseOffering.id,
        facilitatorId: testFacilitator.id,
        weekNumber: 53, // Invalid week number
        weekStartDate: '2024-02-05',
        weekEndDate: '2024-02-11'
      };

      await expect(ActivityTracker.create(invalidWeekData)).rejects.toThrow();
    });

    test('should validate status enum values', async () => {
      const validData = {
        allocationId: testCourseOffering.id,
        facilitatorId: testFacilitator.id,
        weekNumber: 1,
        weekStartDate: '2024-02-05',
        weekEndDate: '2024-02-11',
        formativeOneGrading: 'Done'
      };

      const tracker = await ActivityTracker.create(validData);
      expect(tracker.formativeOneGrading).toBe('Done');

      const invalidStatusData = {
        ...validData,
        formativeOneGrading: 'Invalid Status'
      };

      await expect(ActivityTracker.create(invalidStatusData)).rejects.toThrow();
    });

    test('should enforce unique constraint on allocation and week', async () => {
      const trackerData = {
        allocationId: testCourseOffering.id,
        facilitatorId: testFacilitator.id,
        weekNumber: 1,
        weekStartDate: '2024-02-05',
        weekEndDate: '2024-02-11'
      };

      await ActivityTracker.create(trackerData);

      // Try to create another tracker for the same allocation and week
      await expect(ActivityTracker.create(trackerData)).rejects.toThrow();
    });
  });

  describe('ActivityTracker Instance Methods', () => {
    let activityTracker;

    beforeEach(async () => {
      activityTracker = await ActivityTracker.create({
        allocationId: testCourseOffering.id,
        facilitatorId: testFacilitator.id,
        weekNumber: 1,
        weekStartDate: '2024-02-05',
        weekEndDate: '2024-02-11'
      });
    });

    test('isComplete should return false when not all tasks are done', () => {
      expect(activityTracker.isComplete()).toBe(false);
    });

    test('isComplete should return true when all tasks are done', async () => {
      await activityTracker.update({
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Done',
        summativeGrading: 'Done',
        courseModeration: 'Done',
        intranetSync: 'Done',
        gradeBookStatus: 'Done'
      });

      expect(activityTracker.isComplete()).toBe(true);
    });

    test('getCompletionPercentage should return correct percentage', async () => {
      // Initially all are 'Not Started', so 0%
      expect(activityTracker.getCompletionPercentage()).toBe(0);

      // Complete 3 out of 6 tasks (50%)
      await activityTracker.update({
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Done',
        summativeGrading: 'Done'
      });

      expect(activityTracker.getCompletionPercentage()).toBe(50);

      // Complete all tasks (100%)
      await activityTracker.update({
        courseModeration: 'Done',
        intranetSync: 'Done',
        gradeBookStatus: 'Done'
      });

      expect(activityTracker.getCompletionPercentage()).toBe(100);
    });

    test('getCompletionPercentage should handle partial completion', async () => {
      // Complete 1 out of 6 tasks (17% rounded)
      await activityTracker.update({
        formativeOneGrading: 'Done'
      });

      expect(activityTracker.getCompletionPercentage()).toBe(17);
    });
  });

  describe('ActivityTracker Associations', () => {
    let activityTracker;

    beforeEach(async () => {
      activityTracker = await ActivityTracker.create({
        allocationId: testCourseOffering.id,
        facilitatorId: testFacilitator.id,
        weekNumber: 1,
        weekStartDate: '2024-02-05',
        weekEndDate: '2024-02-11'
      });
    });

    test('should load course offering association', async () => {
      const trackerWithOffering = await ActivityTracker.findByPk(activityTracker.id, {
        include: [{ model: CourseOffering, as: 'courseOffering' }]
      });

      expect(trackerWithOffering.courseOffering).toBeDefined();
      expect(trackerWithOffering.courseOffering.id).toBe(testCourseOffering.id);
    });

    test('should load facilitator association with user', async () => {
      const trackerWithFacilitator = await ActivityTracker.findByPk(activityTracker.id, {
        include: [{
          model: Facilitator,
          as: 'facilitator',
          include: [{ model: User, as: 'user' }]
        }]
      });

      expect(trackerWithFacilitator.facilitator).toBeDefined();
      expect(trackerWithFacilitator.facilitator.id).toBe(testFacilitator.id);
      expect(trackerWithFacilitator.facilitator.user.firstName).toBe('John');
    });

    test('should load nested associations', async () => {
      const fullTracker = await ActivityTracker.findByPk(activityTracker.id, {
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            include: [
              { model: Module, as: 'module' },
              { model: Cohort, as: 'cohort' },
              { model: Class, as: 'class' }
            ]
          },
          {
            model: Facilitator,
            as: 'facilitator',
            include: [{ model: User, as: 'user' }]
          }
        ]
      });

      expect(fullTracker.courseOffering.module).toBeDefined();
      expect(fullTracker.courseOffering.cohort).toBeDefined();
      expect(fullTracker.courseOffering.class).toBeDefined();
      expect(fullTracker.facilitator.user).toBeDefined();
    });
  });

  describe('ActivityTracker Updates', () => {
    let activityTracker;

    beforeEach(async () => {
      activityTracker = await ActivityTracker.create({
        allocationId: testCourseOffering.id,
        facilitatorId: testFacilitator.id,
        weekNumber: 1,
        weekStartDate: '2024-02-05',
        weekEndDate: '2024-02-11'
      });
    });

    test('should update individual status fields', async () => {
      await activityTracker.update({ formativeOneGrading: 'Pending' });
      expect(activityTracker.formativeOneGrading).toBe('Pending');

      await activityTracker.update({ formativeOneGrading: 'Done' });
      expect(activityTracker.formativeOneGrading).toBe('Done');
    });

    test('should update attendance array', async () => {
      const attendance = [true, false, true, true, false];
      await activityTracker.update({ attendance });
      expect(activityTracker.attendance).toEqual(attendance);
    });

    test('should update multiple fields at once', async () => {
      const updates = {
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Pending',
        attendance: [true, true, false],
        notes: 'Week 1 progress notes'
      };

      await activityTracker.update(updates);

      expect(activityTracker.formativeOneGrading).toBe('Done');
      expect(activityTracker.formativeTwoGrading).toBe('Pending');
      expect(activityTracker.attendance).toEqual([true, true, false]);
      expect(activityTracker.notes).toBe('Week 1 progress notes');
    });

    test('should update submission timestamp', async () => {
      expect(activityTracker.submittedAt).toBeNull();

      const submissionTime = new Date();
      await activityTracker.update({ submittedAt: submissionTime });

      expect(activityTracker.submittedAt).toEqual(submissionTime);
    });
  });

  describe('ActivityTracker Queries', () => {
    beforeEach(async () => {
      // Create multiple activity trackers for testing
      await ActivityTracker.bulkCreate([
        {
          allocationId: testCourseOffering.id,
          facilitatorId: testFacilitator.id,
          weekNumber: 1,
          weekStartDate: '2024-02-05',
          weekEndDate: '2024-02-11',
          formativeOneGrading: 'Done',
          formativeTwoGrading: 'Done',
          summativeGrading: 'Done',
          courseModeration: 'Done',
          intranetSync: 'Done',
          gradeBookStatus: 'Done',
          submittedAt: new Date()
        },
        {
          allocationId: testCourseOffering.id,
          facilitatorId: testFacilitator.id,
          weekNumber: 2,
          weekStartDate: '2024-02-12',
          weekEndDate: '2024-02-18',
          formativeOneGrading: 'Pending',
          formativeTwoGrading: 'Not Started'
        },
        {
          allocationId: testCourseOffering.id,
          facilitatorId: testFacilitator.id,
          weekNumber: 3,
          weekStartDate: '2024-02-19',
          weekEndDate: '2024-02-25'
        }
      ]);
    });

    test('should find trackers by facilitator', async () => {
      const trackers = await ActivityTracker.findAll({
        where: { facilitatorId: testFacilitator.id }
      });

      expect(trackers).toHaveLength(3);
    });

    test('should find trackers by week number', async () => {
      const weekOneTracker = await ActivityTracker.findOne({
        where: { weekNumber: 1 }
      });

      expect(weekOneTracker).toBeDefined();
      expect(weekOneTracker.weekNumber).toBe(1);
    });

    test('should find submitted trackers', async () => {
      const submittedTrackers = await ActivityTracker.findAll({
        where: { submittedAt: { [require('sequelize').Op.ne]: null } }
      });

      expect(submittedTrackers).toHaveLength(1);
    });

    test('should find unsubmitted trackers', async () => {
      const unsubmittedTrackers = await ActivityTracker.findAll({
        where: { submittedAt: null }
      });

      expect(unsubmittedTrackers).toHaveLength(2);
    });

    test('should order by week number', async () => {
      const trackers = await ActivityTracker.findAll({
        order: [['weekNumber', 'ASC']]
      });

      expect(trackers).toHaveLength(3);
      expect(trackers[0].weekNumber).toBe(1);
      expect(trackers[1].weekNumber).toBe(2);
      expect(trackers[2].weekNumber).toBe(3);
    });
  });

  describe('ActivityTracker Complex Scenarios', () => {
    test('should handle date range queries', async () => {
      await ActivityTracker.bulkCreate([
        {
          allocationId: testCourseOffering.id,
          facilitatorId: testFacilitator.id,
          weekNumber: 1,
          weekStartDate: '2024-02-05',
          weekEndDate: '2024-02-11'
        },
        {
          allocationId: testCourseOffering.id,
          facilitatorId: testFacilitator.id,
          weekNumber: 2,
          weekStartDate: '2024-02-12',
          weekEndDate: '2024-02-18'
        }
      ]);

      const trackersInRange = await ActivityTracker.findAll({
        where: {
          weekStartDate: {
            [require('sequelize').Op.gte]: '2024-02-01'
          },
          weekEndDate: {
            [require('sequelize').Op.lte]: '2024-02-20'
          }
        }
      });

      expect(trackersInRange).toHaveLength(2);
    });

    test('should calculate completion statistics', async () => {
      await ActivityTracker.bulkCreate([
        {
          allocationId: testCourseOffering.id,
          facilitatorId: testFacilitator.id,
          weekNumber: 1,
          weekStartDate: '2024-02-05',
          weekEndDate: '2024-02-11',
          formativeOneGrading: 'Done',
          formativeTwoGrading: 'Done',
          summativeGrading: 'Done',
          courseModeration: 'Done',
          intranetSync: 'Done',
          gradeBookStatus: 'Done'
        },
        {
          allocationId: testCourseOffering.id,
          facilitatorId: testFacilitator.id,
          weekNumber: 2,
          weekStartDate: '2024-02-12',
          weekEndDate: '2024-02-18',
          formativeOneGrading: 'Done',
          formativeTwoGrading: 'Pending'
        }
      ]);

      const trackers = await ActivityTracker.findAll();
      const completionPercentages = trackers.map(tracker => tracker.getCompletionPercentage());
      const averageCompletion = completionPercentages.reduce((sum, pct) => sum + pct, 0) / completionPercentages.length;

      expect(completionPercentages).toContain(100); // First tracker is 100% complete
      expect(completionPercentages).toContain(17);  // Second tracker is ~17% complete
      expect(averageCompletion).toBeCloseTo(58.5, 1); // Average should be around 58.5%
    });
  });
});
