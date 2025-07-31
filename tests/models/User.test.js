const { User, Manager, Facilitator, Student } = require('../../models');
const { sequelize } = require('../../models');
const bcrypt = require('bcrypt');

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('User Creation', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'manager'
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe(userData.role);
      expect(user.isActive).toBe(true);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    test('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'facilitator'
      };

      const user = await User.create(userData);
      const isPasswordHashed = await bcrypt.compare(userData.password, user.password);
      
      expect(isPasswordHashed).toBe(true);
    });

    test('should not allow duplicate emails', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'manager'
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should validate password length', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
        role: 'facilitator'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should validate role enum', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'invalid_role'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'manager'
      });
    });

    test('validatePassword should return true for correct password', async () => {
      const isValid = await user.validatePassword('Password123!');
      expect(isValid).toBe(true);
    });

    test('validatePassword should return false for incorrect password', async () => {
      const isValid = await user.validatePassword('wrongpassword');
      expect(isValid).toBe(false);
    });

    test('getFullName should return concatenated first and last name', () => {
      const fullName = user.getFullName();
      expect(fullName).toBe('John Doe');
    });

    test('toJSON should exclude password', () => {
      const userJson = user.toJSON();
      expect(userJson.password).toBeUndefined();
      expect(userJson.email).toBe('test@example.com');
    });
  });

  describe('User Associations', () => {
    test('should create manager profile for manager role', async () => {
      const user = await User.create({
        email: 'manager@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Manager',
        role: 'manager'
      });

      const manager = await Manager.create({
        userId: user.id,
        department: 'IT'
      });

      const userWithProfile = await User.findByPk(user.id, {
        include: [{ model: Manager, as: 'managerProfile' }]
      });

      expect(userWithProfile.managerProfile).toBeDefined();
      expect(userWithProfile.managerProfile.department).toBe('IT');
    });

    test('should create facilitator profile for facilitator role', async () => {
      const user = await User.create({
        email: 'facilitator@example.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'Facilitator',
        role: 'facilitator'
      });

      const facilitator = await Facilitator.create({
        userId: user.id,
        employeeId: 'EMP001',
        department: 'Computer Science'
      });

      const userWithProfile = await User.findByPk(user.id, {
        include: [{ model: Facilitator, as: 'facilitatorProfile' }]
      });

      expect(userWithProfile.facilitatorProfile).toBeDefined();
      expect(userWithProfile.facilitatorProfile.employeeId).toBe('EMP001');
    });

    test('should create student profile for student role', async () => {
      const user = await User.create({
        email: 'student@example.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Student',
        role: 'student'
      });

      const student = await Student.create({
        userId: user.id,
        studentId: 'STU001',
        enrollmentDate: new Date()
      });

      const userWithProfile = await User.findByPk(user.id, {
        include: [{ model: Student, as: 'studentProfile' }]
      });

      expect(userWithProfile.studentProfile).toBeDefined();
      expect(userWithProfile.studentProfile.studentId).toBe('STU001');
    });
  });

  describe('User Updates', () => {
    test('should hash password when updated', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'manager'
      });

      const originalPassword = user.password;
      await user.update({ password: 'NewPassword123!' });

      expect(user.password).not.toBe(originalPassword);
      expect(user.password).not.toBe('NewPassword123!');
      
      const isValidOld = await bcrypt.compare('Password123!', user.password);
      const isValidNew = await bcrypt.compare('NewPassword123!', user.password);
      
      expect(isValidOld).toBe(false);
      expect(isValidNew).toBe(true);
    });

    test('should not hash password if not changed', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'manager'
      });

      const originalPassword = user.password;
      await user.update({ firstName: 'Jane' });

      expect(user.password).toBe(originalPassword);
    });

    test('should update lastLoginAt timestamp', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'manager'
      });

      expect(user.lastLoginAt).toBeNull();

      const loginTime = new Date();
      await user.update({ lastLoginAt: loginTime });

      expect(user.lastLoginAt).toEqual(loginTime);
    });
  });

  describe('User Queries', () => {
    beforeEach(async () => {
      await User.bulkCreate([
        {
          email: 'manager1@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Manager',
          role: 'manager',
          isActive: true
        },
        {
          email: 'facilitator1@example.com',
          password: 'Password123!',
          firstName: 'Jane',
          lastName: 'Facilitator',
          role: 'facilitator',
          isActive: true
        },
        {
          email: 'student1@example.com',
          password: 'Password123!',
          firstName: 'Bob',
          lastName: 'Student',
          role: 'student',
          isActive: false
        }
      ]);
    });

    test('should find users by role', async () => {
      const managers = await User.findAll({ where: { role: 'manager' } });
      const facilitators = await User.findAll({ where: { role: 'facilitator' } });
      const students = await User.findAll({ where: { role: 'student' } });

      expect(managers).toHaveLength(1);
      expect(facilitators).toHaveLength(1);
      expect(students).toHaveLength(1);
    });

    test('should find active users', async () => {
      const activeUsers = await User.findAll({ where: { isActive: true } });
      const inactiveUsers = await User.findAll({ where: { isActive: false } });

      expect(activeUsers).toHaveLength(2);
      expect(inactiveUsers).toHaveLength(1);
    });

    test('should find user by email', async () => {
      const user = await User.findOne({ where: { email: 'manager1@example.com' } });
      
      expect(user).toBeDefined();
      expect(user.role).toBe('manager');
      expect(user.firstName).toBe('John');
    });
  });
});
