import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: 'teal' | 'blue' | 'ochre' | 'muted';
  subLabel?: string;
  meta?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  minWidth?: string;
  maxWidth?: string;
  width?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = '-- Chọn giá trị --',
  showSearch = true,
  searchPlaceholder = 'Tìm kiếm...',
  minWidth = '220px',
  maxWidth,
  width = '100%',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Đóng khi click ngoài component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Auto focus vào search input khi mở
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.badge && opt.badge.toLowerCase().includes(term)) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(term)) ||
        (opt.meta && opt.meta.toLowerCase().includes(term))
    );
  }, [options, search]);

  const getBadgeStyle = (color?: CustomSelectOption['badgeColor']) => {
    switch (color) {
      case 'blue':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'ochre':
        return { backgroundColor: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.3)' };
      case 'muted':
        return { backgroundColor: 'var(--soft)', color: 'var(--muted)', border: '1px solid var(--line)' };
      case 'teal':
      default:
        return { backgroundColor: 'var(--teal-soft)', color: 'var(--teal)', border: '1px solid rgba(14, 106, 104, 0.25)' };
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: width,
        minWidth: minWidth,
        maxWidth: maxWidth,
        display: 'inline-block'
      }}
    >
      {/* Nút Trigger mở Dropdown */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearch('');
          }
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '8px 12px',
          fontSize: '13px',
          borderRadius: 'var(--radius-sm)',
          border: isOpen ? '1px solid var(--teal)' : '1px solid var(--line)',
          backgroundColor: 'var(--panel)',
          color: selectedOption ? 'var(--ink)' : 'var(--muted)',
          boxShadow: isOpen ? '0 0 0 3px var(--teal-glow)' : 'var(--shadow-sm)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s ease',
          outline: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
          {selectedOption ? (
            <>
              {selectedOption.icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{selectedOption.icon}</span>}
              {selectedOption.badge && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    ...getBadgeStyle(selectedOption.badgeColor)
                  }}
                >
                  {selectedOption.badge}
                </span>
              )}
              <span
                style={{
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={selectedOption.label}
              >
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--muted)', fontStyle: 'normal' }}>{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={14}
          style={{
            color: 'var(--muted)',
            flexShrink: 0,
            transition: 'transform 0.15s ease',
            transform: isOpen ? 'rotate(180deg)' : 'none'
          }}
        />
      </button>

      {/* Popover Menu Danh Sách Options */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1050,
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '340px',
            animation: 'fadeIn 0.12s ease-out'
          }}
        >
          {/* Ô Tìm kiếm Search Input */}
          {showSearch && options.length > 3 && (
            <div
              style={{
                padding: '8px 10px',
                borderBottom: '1px solid var(--line)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '4px 0',
                  fontSize: '12.5px',
                  color: 'var(--ink)',
                  width: '100%',
                  outline: 'none',
                  boxShadow: 'none'
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Danh sách các Option Item */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      backgroundColor: isSelected ? 'var(--teal-soft)' : 'transparent',
                      color: isSelected ? 'var(--teal)' : 'var(--ink)',
                      transition: 'background 0.12s ease',
                      marginBottom: '2px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--soft)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {/* Phần nội dung bên trái */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      {opt.icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{opt.icon}</span>}
                      {opt.badge && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            ...getBadgeStyle(opt.badgeColor)
                          }}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: isSelected ? 600 : 500,
                            lineHeight: 1.35,
                            wordBreak: 'break-word'
                          }}
                        >
                          {opt.label}
                        </span>
                        {opt.subLabel && (
                          <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                            {opt.subLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phần số tiền/meta bên phải */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {opt.meta && (
                        <span
                          style={{
                            fontSize: '12px',
                            fontFamily: 'var(--f-num)',
                            fontWeight: 600,
                            color: isSelected ? 'var(--teal)' : 'var(--ink)',
                            whiteSpace: 'nowrap',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {opt.meta}
                        </span>
                      )}
                      {isSelected && <Check size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12.5px' }}>
                Không tìm thấy kết quả nào phù hợp
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

