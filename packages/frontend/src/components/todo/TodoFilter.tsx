import { Group, Select } from '@mantine/core';
import { Priority } from '@todo-app/shared/src/types/todo';
import { PriorityFilter, SortOption } from '../../utils/todoFilters';

interface TodoFilterProps {
  priorityFilter: PriorityFilter;
  sortOption: SortOption;
  onPriorityChange: (value: PriorityFilter) => void;
  onSortChange: (value: SortOption) => void;
}

const priorityFilterOptions = [
  { value: 'ALL', label: '전체' },
  { value: Priority.HIGH, label: '높음' },
  { value: Priority.MEDIUM, label: '보통' },
  { value: Priority.LOW, label: '낮음' },
];

const sortOptions = [
  { value: 'createdAt', label: '생성일순' },
  { value: 'dueDate', label: '마감일순' },
  { value: 'priority', label: '우선순위순' },
  { value: 'title', label: '이름순' },
];

export function TodoFilter({ priorityFilter, sortOption, onPriorityChange, onSortChange }: TodoFilterProps) {
  return (
    <Group grow>
      <Select
        label="우선순위 필터"
        data={priorityFilterOptions}
        value={priorityFilter}
        onChange={(v) => onPriorityChange((v as PriorityFilter) || 'ALL')}
        allowDeselect={false}
        aria-label="우선순위 필터"
      />
      <Select
        label="정렬"
        data={sortOptions}
        value={sortOption}
        onChange={(v) => onSortChange((v as SortOption) || 'createdAt')}
        allowDeselect={false}
        aria-label="정렬 기준"
      />
    </Group>
  );
}
