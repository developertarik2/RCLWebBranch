import { INavbarData } from "./helper";

export const navbarData: INavbarData[] = [
    {
        routeLink: 'dashboard',
        icon: 'fal fa-home',
        label: 'Dashboard'
    },
    {
        routeLink: 'products',
        icon: 'fal fa-box-open',
        label: 'CDBL',
        items: [
            {
                routeLink: 'products/level1.1',
                label: 'Level 1.1',
                items: [
                    {
                        routeLink: 'products/level2.1',
                        label: 'Level 2.1',
                    },
                    {
                        routeLink: 'products/level2.2',
                        label: 'Level 2.2',
                        items: [
                            {
                                routeLink: 'products/level3.1',
                                label: 'Level 3.1'
                            },
                            {
                                routeLink: 'products/level3.2',
                                label: 'Level 3.2'
                            }
                        ]
                    }
                ]
            },
            {
                routeLink: 'products/level1.2',
                label: 'Level 1.2',
            }
        ]
    },
    {
        routeLink: 'statistics',
        icon: 'fal fa-chart-bar',
        label: 'Statistics'
    },
    {
        routeLink: 'coupens',
        icon: 'fal fa-tags',
        label: 'CDBL',
        items: [
            {
                routeLink: 'coupens/list',
                label: 'BO Acknowledgement'
            },
            {
                routeLink: 'coupens/create',
                label: 'BO Sale'
            },
            {
                routeLink: 'coupens/list',
                label: 'CDBL Charge Receive'
            },
            {
                routeLink: 'coupens/create',
                label: 'Create New Client'
                
            }
        ]
    },
    {
        routeLink: 'products',
        icon: 'fal fa-box-open',
        label: 'Reports',
        items: [
            {
                routeLink: 'products/level1.1',
                label: 'Client Reports',
                items: [
                    {
                        routeLink: 'products/level2.1',
                        label: 'Portfolio',
                    },
                    {
                        routeLink: 'products/level2.1',
                        label: 'Client Ledger',
                    },
                    {
                        routeLink: 'products/level2.1',
                        label: 'Client Confirmation',
                    },
                    {
                        routeLink: 'products/level2.1',
                        label: 'Client Ledger',
                    },
                    {
                        routeLink: 'products/level2.1',
                        label: 'Client Ledger',
                    },
                    {
                        routeLink: 'products/level2.1',
                        label: 'Client Ledger',
                    },
                    {
                        routeLink: 'products/level2.2',
                        label: 'Level 2.2',
                        items: [
                            {
                                routeLink: 'products/level3.1',
                                label: 'Level 3.1'
                            },
                            {
                                routeLink: 'products/level3.2',
                                label: 'Level 3.2'
                            }
                        ]
                    }
                ]
            },
            {
                routeLink: 'products/level1.2',
                label: 'Level 1.2',
            }
        ]
    },
    {
        routeLink: 'pages',
        icon: 'fal fa-file',
        label: 'Pages'
    },
    {
        routeLink: 'media',
        icon: 'fal fa-camera',
        label: 'Media'
    },
    {
        routeLink: 'settings',
        icon: 'fal fa-cog',
        label: 'Settings',
        expanded: true,
        items: [
            {
                routeLink: 'settings/profile',
                label: 'Profile'
            },
            {
                routeLink: 'settings/customize',
                label: 'Customize'
            }
        ]
    },
];