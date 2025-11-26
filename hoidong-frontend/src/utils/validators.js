import * as Yup from 'yup';

// Custom error messages in Vietnamese
Yup.setLocale({
  mixed: {
    required: 'Trường này là bắt buộc',
    notType: 'Giá trị không hợp lệ',
  },
  string: {
    email: 'Email không hợp lệ',
    min: 'Tối thiểu ${min} ký tự',
    max: 'Tối đa ${max} ký tự',
  },
  number: {
    min: 'Giá trị tối thiểu là ${min}',
    max: 'Giá trị tối đa là ${max}',
    positive: 'Phải là số dương',
    integer: 'Phải là số nguyên',
  },
  date: {
    min: 'Ngày phải sau ${min}',
    max: 'Ngày phải trước ${max}',
  },
});

// Login validation schema
export const loginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập')
    .min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

// Sister validation schema
export const sisterSchema = Yup.object().shape({
  ho_ten: Yup.string()
    .required('Vui lòng nhập họ tên')
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  ten_thanh: Yup.string()
    .required('Vui lòng nhập tên thánh')
    .max(50, 'Tên thánh tối đa 50 ký tự'),
  ten_dong: Yup.string()
    .max(50, 'Tên dòng tối đa 50 ký tự'),
  ngay_sinh: Yup.date()
    .required('Vui lòng chọn ngày sinh')
    .max(new Date(), 'Ngày sinh không thể là ngày trong tương lai'),
  noi_sinh: Yup.string()
    .max(200, 'Nơi sinh tối đa 200 ký tự'),
  so_cmnd: Yup.string()
    .matches(/^[0-9]{9,12}$/, 'CMND/CCCD phải từ 9-12 số'),
  so_dien_thoai: Yup.string()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải từ 10-11 số'),
  email: Yup.string()
    .email('Email không hợp lệ'),
  dia_chi_hien_tai: Yup.string()
    .max(500, 'Địa chỉ tối đa 500 ký tự'),
});

// Vocation journey validation schema
export const vocationJourneySchema = Yup.object().shape({
  sister_id: Yup.number()
    .required('Vui lòng chọn nữ tu'),
  giai_doan: Yup.string()
    .required('Vui lòng chọn giai đoạn')
    .oneOf(['tim_hieu', 'nha', 'thinh_sinh', 'tap_sinh', 'khan_tam', 'khan_trong'], 'Giai đoạn không hợp lệ'),
  ngay_bat_dau: Yup.date()
    .required('Vui lòng chọn ngày bắt đầu'),
  ngay_ket_thuc: Yup.date()
    .nullable()
    .min(Yup.ref('ngay_bat_dau'), 'Ngày kết thúc phải sau ngày bắt đầu'),
  ghi_chu: Yup.string()
    .max(1000, 'Ghi chú tối đa 1000 ký tự'),
});

// Community validation schema
export const communitySchema = Yup.object().shape({
  ten_cong_doan: Yup.string()
    .required('Vui lòng nhập tên cộng đoàn')
    .max(200, 'Tên cộng đoàn tối đa 200 ký tự'),
  dia_chi: Yup.string()
    .max(500, 'Địa chỉ tối đa 500 ký tự'),
  dien_thoai: Yup.string()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải từ 10-11 số'),
  email: Yup.string()
    .email('Email không hợp lệ'),
  ngay_thanh_lap: Yup.date()
    .nullable()
    .max(new Date(), 'Ngày thành lập không thể là ngày trong tương lai'),
});

// Education validation schema
export const educationSchema = Yup.object().shape({
  sister_id: Yup.number()
    .required('Vui lòng chọn nữ tu'),
  trinh_do: Yup.string()
    .required('Vui lòng chọn trình độ'),
  nganh_hoc: Yup.string()
    .max(200, 'Ngành học tối đa 200 ký tự'),
  truong: Yup.string()
    .max(200, 'Tên trường tối đa 200 ký tự'),
  nam_tot_nghiep: Yup.number()
    .nullable()
    .min(1950, 'Năm tốt nghiệp không hợp lệ')
    .max(new Date().getFullYear(), 'Năm tốt nghiệp không thể là năm trong tương lai'),
});

// User validation schema
export const userSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập')
    .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
    .max(50, 'Tên đăng nhập tối đa 50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới'),
  email: Yup.string()
    .required('Vui lòng nhập email')
    .email('Email không hợp lệ'),
  password: Yup.string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Mật khẩu xác nhận không khớp'),
  role: Yup.string()
    .required('Vui lòng chọn vai trò'),
});

// Change password validation schema
export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: Yup.string()
    .required('Vui lòng nhập mật khẩu mới')
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số')
    .notOneOf([Yup.ref('currentPassword')], 'Mật khẩu mới phải khác mật khẩu hiện tại'),
  confirmPassword: Yup.string()
    .required('Vui lòng xác nhận mật khẩu mới')
    .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu xác nhận không khớp'),
});

// Validate helper function
export const validate = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach((e) => {
      errors[e.path] = e.message;
    });
    return { isValid: false, errors };
  }
};

export default Yup;
