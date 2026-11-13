# Thiết kế cơ sở dữ liệu Chấm Công & Lương

## Sơ đồ quan hệ

```mermaid
erDiagram
    STAFF ||--o{ ATTENDANCE_ENTRIES : "được chấm"
    STAFF ||--o{ ATTENDANCE_LOGS : "ghi log"
    STAFF ||--o{ STAFF_BENEFITS : "có phúc lợi"
    ATTENDANCE_PERIODS ||--o{ ATTENDANCE_ENTRIES : "gồm"
    ATTENDANCE_PERIODS ||--o{ ATTENDANCE_HOLIDAYS : "có ngày lễ"
    STAFF ||--o{ PAYROLL_RECORDS : "có bảng lương"
    ATTENDANCE_PERIODS ||--o{ PAYROLL_RECORDS : "chốt theo kỳ"

    STAFF {
        varchar id PK
        varchar name
        varchar department
        date hire_date
        varchar role
        numeric base_salary
        numeric allowance
        varchar status
    }

    ATTENDANCE_PERIODS {
        varchar month PK "YYYY-MM"
        numeric standard_days
        varchar status "open | locked | paid"
        text note
        timestamptz updated_at
    }

    ATTENDANCE_HOLIDAYS {
        bigint id PK
        varchar month FK
        date holiday_date
        varchar label
        boolean is_paid
    }

    ATTENDANCE_ENTRIES {
        bigint id PK
        varchar month FK
        varchar staff_id FK
        date work_date
        varchar value_code "1 | 0.5 | L | X | 2"
        numeric work_units
        numeric pay_multiplier
        varchar status
        text note
        timestamptz logged_at "Time"
        timestamptz updated_at
    }

    ATTENDANCE_LOGS {
        bigint id PK
        varchar staff_id FK
        date work_date
        varchar value_code
        varchar action
        timestamptz logged_at
    }

    STAFF_BENEFITS {
        bigint id PK
        varchar month FK
        varchar staff_id FK
        numeric holiday_sunday "Lễ, CN"
        numeric ot "OT"
        numeric kpi "KPI"
        numeric bhxh "BHXH"
        numeric tax "Thuế"
        timestamptz time "Time"
    }

    PAYROLL_RECORDS {
        bigint id PK
        varchar month FK
        varchar staff_id FK
        numeric base_salary
        numeric allowance
        numeric kpi
        numeric insurance_salary
        integer dependents
        numeric advance
        numeric work_days
        numeric holiday_work_days
        numeric sunday_work_days
        numeric gross_salary
        numeric pit_tax
        numeric net_salary
        varchar status "draft | confirmed | paid"
    }
```

## Quy tắc dữ liệu

- `attendance_periods` là bảng gốc của từng kỳ công; không dùng `app_metadata.attMonth` làm nguồn chính.
- `attendance_entries` lưu một dòng cho mỗi `nhân sự + ngày + kỳ`; khóa duy nhất là `(month, staff_id, work_date)`.
- `value_code` giữ đúng ký hiệu trên giao diện: `1`, `0.5`, `L`, `X`, `2`.
- `work_units` và `pay_multiplier` được lưu cùng dòng để đối soát rõ cách tính, không phải suy luận lại từ giao diện.
- `attendance_holidays` tách ngày lễ khỏi JSON để truy vấn, kiểm tra và khóa kỳ dễ dàng.
- `payroll_records` là snapshot bảng lương theo kỳ; khi chốt lương có thể giữ nguyên số liệu dù thông tin nhân sự thay đổi sau đó.
- `attendance_logs` là nhật ký append-only: mỗi lần nhân sự được chấm, sửa hoặc xóa ô đều tạo một log có `logged_at`.
- `staff_benefits` có một dòng khởi tạo cho mỗi `nhân sự + kỳ`; dùng để lưu `Lễ, CN`, `OT`, `KPI`, `BHXH`, `Thuế`. Khi chấm `X` ngày lễ hoặc `2` vào Chủ nhật, cột `holiday_sunday` được tính lại và cập nhật `time` trong cùng transaction.
- Các bảng chi tiết đều có khóa ngoại tới `staff` và `attendance_periods`, đồng thời có `updated_at` để kiểm toán.

## Dữ liệu đã triển khai

- Kỳ `2026-09`: `1` dòng trong `attendance_periods`.
- Ngày lễ: `4` dòng trong `attendance_holidays`.
- Chấm công: `104` dòng trong `attendance_entries`.
- Snapshot nhân sự: `5` dòng trong `payroll_records`.
- Dữ liệu cũ trong `app_metadata` đã được backfill một lần; các lần khởi động sau không ghi đè dữ liệu mới trong bảng chuẩn.
