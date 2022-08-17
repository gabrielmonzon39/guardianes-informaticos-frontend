const routes = [
  {
    path: "/",
    component: () => import("layouts/MainNew.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        name: "index",
      },
    ],
  },
  {
    path: "/edit/:client_id/:monday_date",
    component: () => import("layouts/MainNew.vue"),
    children: [{ path: "", component: () => import("pages/EditPage.vue") }],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
