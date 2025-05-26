import { Navigate, redirect, Route, Router } from '@solidjs/router'
import { For, lazy } from 'solid-js'

export const routes = [
  {
    path: '/main',
    redirect: '/main/paste',
    component: lazy(() => import('../views/Main')),
    label: '主页',
    children: [
      {
        path: 'tip',
        component: lazy(() => import('../views/Tip')),
        label: '提示',
      },
      {
        path: 'paste',
        component: lazy(() => import('../views/Paste')),
        label: '粘贴',
      },
    ],
  },
]

export default function RouterView() {
  return (
    <Router>
      <For each={routes}>
        {route => (
          <Route path={route.path} component={route.component}>
            {
              route.redirect && (
                <Route path="/" component={() => <Navigate href={route.redirect} />} />
              )
            }
            {
              route.children && (
                <For each={route.children}>
                  {child => (
                    <Route path={child.path} component={child.component} />
                  )}
                </For>
              )
            }
          </Route>
        )}
      </For>
    </Router>
  )
}
