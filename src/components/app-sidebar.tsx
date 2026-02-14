"use client"

import * as React from "react"
import {
  IconVideo,
} from "@tabler/icons-react"
import Image from "next/image"
import "@/lib/auth-config";
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconVideo,
      isActive: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentUser, setCurrentUser] = React.useState({
    name: "",
    email: "",
    avatar: ""
  });

  React.useEffect(() => {
    async function loadUser() {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.payload;

        if (idToken) {
          setCurrentUser({
            name: (idToken.name as string) || (idToken.given_name as string) || (idToken.email as string) || "Usuário",
            email: (idToken.email as string) || "",
            avatar: (idToken.picture as string) || ""
          });
          return;
        }

        await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setCurrentUser({
          name: attributes.name || attributes.email || "Usuário",
          email: attributes.email || "",
          avatar: attributes.picture || ""
        })
      } catch {

      }
    }

    loadUser();


    const hubListener = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn' || payload.event === 'tokenRefresh') {
        loadUser();
      }
    });

    return () => hubListener();
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <Image
                  src="/fiap-lab.svg"
                  width={50}
                  height={50}
                  className="!size-5"
                  alt="Logo do FIAP Lab"
                />
                <span className="text-base font-semibold">Fiap Lab</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
