import User from "../models/user";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
  studentClass?: string;
  teacherSubject?: string[];
  isActive?: boolean;
}

export const registerUser = async (data: RegisterPayload) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = await User.create(data);

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
};


interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  studentClass?: string;
  teacherSubject?: string[];
  password?: string;
}

/**
 * Update user by admin
 */
export const updateUserByAdmin = async (
  userId: string,
  data: UpdateUserPayload
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.name = data.name ?? user.name;
  user.email = data.email ?? user.email;
  user.role = (data.role as any) ?? user.role;
  user.isActive =
    data.isActive !== undefined ? data.isActive : user.isActive;
  user.studentClass = data.studentClass ?? user.studentClass;
  user.teacherSubject = data.teacherSubject ?? user.teacherSubject;

  if (data.password) {
    user.password = data.password;
  }

  return await user.save();
};

/**
 * Get users with pagination & filtering
 */
export const getUsersService = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const role = query.role;
  const search = query.search;

  const skip = (page - 1) * limit;

  const filter: any = {};

  if (role && role !== "all") {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  };
};

/**
 * Delete user by admin
 */
export const deleteUserByAdmin = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  await user.deleteOne();
  return user;
};
