import { Group, Title, Text, Button, Burger, Menu, Box } from '@mantine/core';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
  mobileMenuOpened?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Header({ username, onLogout, mobileMenuOpened, onMobileMenuToggle }: HeaderProps) {
  return (
    <Group justify="space-between" h="100%" px="md">
      <Group gap="xs">
        {onMobileMenuToggle && (
          <Burger
            opened={mobileMenuOpened}
            onClick={onMobileMenuToggle}
            hiddenFrom="sm"
            size="sm"
            aria-label="메뉴 열기"
          />
        )}
        <Title order={3} fz={{ base: 'lg', sm: 'xl' }}>TODO 앱</Title>
      </Group>
      {username && (
        <>
          <Group gap="sm" visibleFrom="sm">
            <Text size="sm" c="dimmed">{username}</Text>
            <Button variant="subtle" size="xs" onClick={onLogout}>
              로그아웃
            </Button>
          </Group>
          <Box hiddenFrom="sm">
            <Menu position="bottom-end">
              <Menu.Target>
                <Button variant="subtle" size="xs" px="xs">⋮</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{username}</Menu.Label>
                <Menu.Item onClick={onLogout}>로그아웃</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
        </>
      )}
    </Group>
  );
}
