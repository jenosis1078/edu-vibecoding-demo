import { Group, Title, Text, Button } from '@mantine/core';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}

export function Header({ username, onLogout }: HeaderProps) {
  return (
    <Group justify="space-between" h="100%" px="md">
      <Title order={3}>TODO 앱</Title>
      {username && (
        <Group gap="sm">
          <Text size="sm" c="dimmed">{username}</Text>
          <Button variant="subtle" size="xs" onClick={onLogout}>
            로그아웃
          </Button>
        </Group>
      )}
    </Group>
  );
}
