export interface Role {
  roleId: number;
  roleName: string;
  level: number;
  createDate: string;
  createBy: number;
  updateDate: string;
  updateBy: number;
  isActive: boolean;
}

export interface Employee {
  empId: number;
  empFirstName: string;
  empLastName: string;
  empMiddleName: string;
  empEmail: string;
  pin: string;
  role: Role;
  createDate: string;
  createBy: number;
  updateDate: string;
  updateBy: number;
  isActive: boolean;
} 