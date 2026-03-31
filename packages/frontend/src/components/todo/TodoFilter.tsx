import { Group, Select, Badge } from '@mantine/core';
import { Priority } from '@todo-app/shared/src/types/todo';
import { PriorityFilter, SortOption } from '../../utils/todoFilters';

interface TodoFilterProps {
  priorityFilter: PriorityFilter;
  sortOption: SortOption;
  onPriorityChange: (value: PriorityFilter) => void;
  onSortChange: (value: SortOption) => void;
  totalCount: number;
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

export function TodoFilter({ priorityFilter, sortOption, onPriorityChange, onSortChange, totalCount }: TodoFilterProps) {
  return (
    <Group grow align="flex-end">
      <Select
        label="필터"
        data={priorityFilterOptions}
        value={priorityFilter}
        onChange={(v) => onPriorityChange((v as PriorityFilter) || 'ALL')}
        allowDeselect={false}
        size="xs"
        aria-label="우선순위 필터"
      />
      <Select
        label="정렬"
        data={sortOptions}
        value={sortOption}
        onChange={(v) => onSortChange((v as SortOption) || 'createdAt')}
        allowDeselect={false}
        size="xs"
        aria-label="정렬 기준"
      />
      <Badge variant="light" size="lg" style={{ alignSelf: 'flex-end', marginBottom: 2 }}>
        {totalCount}건
      </Badge>
    </Group>
  );
}
