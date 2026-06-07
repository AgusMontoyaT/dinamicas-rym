import { Routes } from '@angular/router';
import { Inicio } from './web/pages/inicio/inicio';
import { Intruso } from './web/pages/intruso/intruso';
import { Parejas } from './web/pages/parejas/parejas';
import { Trivia } from './web/pages/trivia/trivia';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'inicio',
        component: Inicio,
        canActivate: [authGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./web/pages/login/login').then((m) => m.Login),
        canActivate: [publicGuard]
    },
    {
        path: 'ranking',
        loadComponent: () => import('./web/pages/ranking/ranking').then((m) => m.Ranking)
    },
    {
        path: 'parejas',
        component: Parejas,
        canActivate: [authGuard]
    },
    {
        path: 'parejas/:dificultad',
        component: Parejas,
        canActivate: [authGuard]
    },
    {
        path: 'intruso',
        component: Intruso,
        canActivate: [authGuard]
    },
    {
        path: 'intruso/:dificultad',
        component: Intruso,
        canActivate: [authGuard]
    },
    {
        path: 'trivia',
        component: Trivia,
        canActivate: [authGuard]
    },
    {
        path: 'trivia/:dificultad',
        component: Trivia,
        canActivate: [authGuard]
    },
];
