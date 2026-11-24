import { useMemo } from "react";
import rawOfficeData from "@/data/office.json";
import type {
  Department,
  DepartmentId,
  MemberWithDepartment,
  OfficeData,
} from "@/types/office";

const officeData = rawOfficeData as unknown as OfficeData;

export function useOfficeData() {
  return useMemo(() => {
    const departments = officeData.departments;
    const lobby = officeData.lobby;

    const allMembers: MemberWithDepartment[] = departments.flatMap((dept) =>
      dept.members.map((member) => ({
        ...member,
        departmentId: dept.id,
        departmentName: dept.name,
        departmentColor: dept.color,
        zone: dept.zone,
      }))
    );

    const getDepartmentById = (id: DepartmentId): Department | undefined =>
      departments.find((dept) => dept.id === id);

    const getMemberById = (id: string): MemberWithDepartment | undefined =>
      allMembers.find((member) => member.id === id);

    return {
      companyName: officeData.companyName,
      lobby,
      departments,
      allMembers,
      totalDepartments: departments.length,
      totalMembers: allMembers.length,
      getDepartmentById,
      getMemberById,
    };
  }, []);
}
