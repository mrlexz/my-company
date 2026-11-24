import { useEffect, useMemo } from "react";
import rawOfficeData from "@/data/office.json";
import { useOfficeStore } from "@/store/useOfficeStore";
import type {
  CompanyStatus,
  Department,
  DepartmentId,
  MemberWithDepartment,
  OfficeData,
  OfficeMember,
} from "@/types/office";

const officeData = rawOfficeData as unknown as OfficeData;

/** Làm mới dữ liệu thật mỗi 5 phút trong khi Dashboard đang mở. */
const REFRESH_MS = 5 * 60 * 1000;

/**
 * Tải dữ liệu công ty thật từ GET /api/status (đọc file
 * src/data/company-status.json trên server). Lỗi mạng thì giữ nguyên dữ
 * liệu thật đã đóng gói lúc build trong office.json.
 */
async function fetchCompanyStatus(): Promise<void> {
  try {
    const res = await fetch("/api/status", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as CompanyStatus;
    useOfficeStore.getState().setCompanyStatus(data);
  } catch {
    // Giữ dữ liệu build-time, lần làm mới sau sẽ thử lại.
  }
}

// Số component đang dùng hook này — chỉ chạy một vòng tải/làm mới chung
// dù nhiều component cùng gọi hook.
let activeConsumers = 0;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

export function useOfficeData() {
  const companyStatus = useOfficeStore((s) => s.companyStatus);
  const companyStatusUpdatedAt = useOfficeStore((s) => s.companyStatusUpdatedAt);

  // Gọi API ngay khi mở trang, rồi tự làm mới mỗi 5 phút khi còn mở.
  useEffect(() => {
    if (typeof window === "undefined") return;
    activeConsumers += 1;
    if (activeConsumers === 1) {
      void fetchCompanyStatus();
      refreshTimer = setInterval(() => {
        void fetchCompanyStatus();
      }, REFRESH_MS);
    }
    return () => {
      activeConsumers -= 1;
      if (activeConsumers === 0 && refreshTimer !== null) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    };
  }, []);

  return useMemo(() => {
    // Dữ liệu tĩnh (bố cục, vị trí, nhân vật, kỹ năng) giữ nguyên từ
    // office.json; chỉ trạng thái/tiến độ/focus/chức danh được thay bằng
    // dữ liệu thật mới nhất từ API khi đã tải xong.
    let departments = officeData.departments;
    if (companyStatus) {
      const overrides = new Map<string, Partial<OfficeMember>>();
      const addMember = (m: CompanyStatus["executive"][number]) => {
        const override: Partial<OfficeMember> = {
          role: m.title,
          desc: m.role,
          status: m.status,
          focus: m.focus,
        };
        if (m.progress !== undefined) override.progress = m.progress;
        overrides.set(m.id, override);
      };
      companyStatus.executive.forEach(addMember);
      companyStatus.departments.forEach((dept) =>
        dept.members.forEach(addMember),
      );
      departments = officeData.departments.map((dept) => ({
        ...dept,
        members: dept.members.map((member) => {
          const override = overrides.get(member.id);
          return override ? { ...member, ...override } : member;
        }),
      }));
    }
    const lobby = officeData.lobby;

    const allMembers: MemberWithDepartment[] = departments.flatMap((dept) =>
      dept.members.map((member) => ({
        ...member,
        departmentId: dept.id,
        departmentName: dept.name,
        departmentColor: dept.color,
        zone: dept.zone,
      })),
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
      /** Dữ liệu thật mới nhất từ API (null = chưa tải xong). */
      companyStatus,
      /** Thời điểm tải dữ liệu thật thành công gần nhất (ms epoch). */
      companyStatusUpdatedAt,
    };
  }, [companyStatus, companyStatusUpdatedAt]);
}
