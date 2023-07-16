import { Router } from "@ulibs/router";
import express from "express";
import { JSDOM } from "jsdom";

import {
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Row,
  Col,
  View,
  Container,
  Icon,
  ButtonGroup,
  Input,
} from "@ulibs/ui";

function PageHeader({ title }, slots) {
  return Row({ my: "md" }, [
    Col({ col: true }, [title && View({ tag: "h3" }, title)]),
    slots && Col({ col: 0 }, ButtonGroup([slots])),
  ]);
}

const router = Router({ dev: true });

function SidebarItem({ href, title, icon } = {}, $slots) {
  return View(
    {
      tag: "li",
      style: "list-style-type: none",
    },
    View(
      {
        tag: "a",
        href,
        d: "flex",
        py: "xxs",
        px: "sm",
        style: "text-decoration: none; color: var(--color-base-800);",
      },
      [
        Icon({ name: icon }),
        View(
          {
            d: "inline-block",
            ps: "xs",
          },
          title
        ),
      ]
    )
  );
}

function Sidebar($props, $slots) {
  return View(
    {
      "u-sidebar": true,
      tag: "ul",
      h: 100,
      style: "padding-left: 0",
    },
    $slots
  );
}

function Header($props, $slots) {
  return View(
    {
      "u-header": true,
      py: "xs",
      bgColor: "base",
      style: "border-bottom: 1px solid var(--color-base-400);",
    },
    [
      //   "HEader content",
      $slots,
    ]
  );
}

function Body($props, $slots) {
  return Container({ size: "xl", mx: "auto", my: "md" }, [
    $props.user
      ? $slots
      : Card({ mt: "md" }, [CardBody("You are not logged in!")]),
  ]);
}

function AdminLayout($props, $slots) {
  return View(
    {
      htmlHead: [
        View({
          tag: "link",
          rel: "stylesheet",
          href: "https://unpkg.com/@ulibs/ui@next/dist/styles.css",
        }),

        View({
          tag: "script",
          src: "https://unpkg.com/@ulibs/ui@next/dist/ulibs.js",
          defer: true,
          async: true,
        }),
        View(
          { tag: "style" },
          `
        
        [u-sidebar] {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 240px;
            border-right: 1px solid var(--color-base-400);
            background-color: var(--color-base-100);
        }
        .dark [u-sidebar] {
            background-color: var(--color-base-200);
        }

        [u-header] {
            background-color: var(--color-base-100);
        }
        .dark [u-header] {
            background-color: var(--color-base-200);
        }

        [u-col]{
            align-self: initial !important;
        }

        [u-sidebar] {
            display: none;
        }
        [u-content] {
            margin-left: 0;
        }

        @media (min-width: 768px) {
            [u-sidebar] {
                display: block;
            }
            [u-content] {
                margin-left: 240px;
            }
        }

        .dark .hide-dark {
            display: none;
        }
        

        .dark .hide-light {
            display: flex;
        }
        .hide-light {
            display: none;
        }
        
        `
        ),
        View(
          { tag: "script" },
          `
        document.addEventListener('alpine:init', () => {

            Alpine.directive('data-table', (el) => {
                Alpine.bind(el, {
                    'u-data'() {
                        return {
                            sort: undefined
                        }
                    }
                })
            })

            Alpine.magic('table', (el) => {
                return {
                    sort(key) {
                        if(this.$data.sort === key) {
                            this.$data.sort = '-' + key
                        } else {
                            this.$data.sort = key
                        }
                    },
                    get params() {
                        return \`?sort=\${this.$data.sort ?? ''}\`
                    }
                }
            })
        })
        `
        ),
      ],
    },
    [
      Sidebar({}, [
        View({ py: "md", px: "md", tag: "h2" }, "Logo"),
        SidebarItem({ title: "Dashboard", icon: "dashboard", href: "/" }),
        SidebarItem({ title: "Users", icon: "user", href: "/users" }),
        SidebarItem({ title: "Tasks", icon: "list-check", href: "/tasks" }),
      ]),
      View({ "u-content": true }, [
        Header($props, [
          Container({ size: "xl", mx: "auto" }, [
            // check if is logged in from props
            Row({ align: "center" }, [
              Col({ dSm: "none", col: 0 }, Icon({ name: "menu-2" })),
              Col(
                { d: "none", dSm: "block" },
                Input({ style: "margin-bottom: 0", placeholder: "Search" })
              ),
              Col({ col: true }),
              Col({ class: "hide-light" }, [
                Icon({
                  onClick: "el => document.body.classList.toggle('dark')",
                  name: "sun",
                }),
              ]),
              Col({ class: "hide-dark" }, [
                Icon({
                  onClick: "el => document.body.classList.toggle('dark')",
                  name: "moon",
                }),
              ]),
              $props.user
                ? [
                    Col([
                      Avatar(
                        { color: "info" },
                        $props.user.name.substring(0, 2)
                      ),
                    ]),
                    // Form(
                    //   { action: "logout" },
                    //   Col([Button({ color: "error" }, "Logout")])
                    // ),
                  ]
                : Col([Button({ size: "xs", href: "/login" }, "Login")]),
            ]),
          ]),
        ]),
        Body($props, $slots),
      ]),
    ]
  );
}

function Dashboard() {
  return [PageHeader({ title: "Dashboard" }), View("Dashboard content")];
}

function DataTable($props) {
  const columns = $props.columns ?? [];
  const rows = $props.rows ?? [];
  return Table({ "u-data-table": true }, [
    TableHead([
      columns.map((column) =>
        TableCell({ onClick: `$table.sort('${column.key}')` }, [
          column.text,
          "SORT",
        ])
      ),
    ]),
    TableBody([
      $props.rows.map((row) =>
        TableRow([
          columns.map((column) =>
            TableCell([column.render ? column.render(row) : row[column.key]])
          ),
        ])
      ),
    ]),
  ]);
}

function UserList() {
  return [
    PageHeader({ title: "User List" }, [
      Button({ color: "primary" }, [Icon({ name: "plus" }), "Add New User"]),
    ]),
    DataTable({
      rows: [
        {
          firstname: "Hadi",
          lastname: "Ahmadi",
          email: "thehadiahmadi@gmail.com",
          profile: "https://avatars.githubusercontent.com/u/42554876?v=4",
        },
        {
          firstname: "Edriss",
          lastname: "Aria",
          email: "erdisssaria@gmail.com",
          profile: "https://avatars.githubusercontent.com/u/67925134?v=4",
        },
        {
          firstname: "Jawad",
          lastname: "Azizi",
          email: "jawadazizi@gmail.com",
          profile: "https://avatars.githubusercontent.com/u/102347277?v=4",
        },
      ],
      columns: [
        {
          key: "firstname",
          text: "Name",
          render: (item) => `${item.firstname} ${item.lastname}`,
        },
        {
          key: "profile",
          text: "Profile",
          render: (item) => Avatar({ src: item.profile }),
          sort: false,
        },
        {
          key: "email",
          text: "Email",
          sort: (a, b) => (a.email > b.email ? 1 : -1),
        },
      ],
      //
    }),
  ];
}

// router.addLayout("/", {
//   component: AdminLayout,
//   load() {
//     const user = {
//       name: "Hadi Ahmadi",
//       username: "hadiahmadi",
//       email: "thehadiahmadi@gmail.com",
//     };

//     return { user };
//   },
// });

// router.addPage('/', {
//     component: Dashboard
// })

// router.addPage('/users', {
//     component: UserList
// })

// router.addPage('/tasks', {
//     component: TaskList
// })
// router.addPage('/tasks/add', {
//     component: CreateTask
// })
// router.addPage('/tasks/:id', {
//     component: ViewTask
// })

async function renderDynamicPage(page) {
  const dom = new JSDOM(page.toString());

  const loads = [];

  // get list of dynamic content needed to load
  dom.window.document.querySelectorAll("[u-dynamic-list]").forEach((el) => {
    const table = el.getAttribute("u-dynamic-list");

    // add function to load
    loads.push(async () => ({ [table]: data[table] }));
  });

  async function runLoads() {
    let result = {};
    for (let load of loads) {
      result = { ...result, ...(await load()) };
    }
    return result;
  }

  // this function replaces all {some.content} to data[content]
  function render(el, data) {
    el.querySelectorAll("[u-dynamic-item]").forEach((item) => {
      const field = item.getAttribute("u-dynamic-item"); // skip prefix

      item.innerHTML = item.innerHTML.replace(
        new RegExp(`\{${field}\.([\\w\\.]+)\}`, "g"),
        (a, b) => data[b]
      );
    });

    return el.outerHTML;
  }

  // fetch all required data
  const loadResult = await runLoads();

  dom.window.document.querySelectorAll("[u-dynamic-list]").forEach((el) => {
    const table = el.getAttribute("u-dynamic-list");

    const items = loadResult[table];

    // replace placeholder with list of rendered items
    el.outerHTML = el.outerHTML.replace(
      el.outerHTML,
      items.map((item) => render(el.cloneNode(true), item)).join("")
    );
  });

  return dom.window.document.body.innerHTML;
}

function CollectionItem(props, slots) {
  const { name, ...restProps } = props;

  return View({ "u-dynamic-item": name, ...restProps }, slots);
}

function CollectionList(props, slots) {
  const { table, ...restProps } = props;

  return View({ "u-dynamic-list": table, ...restProps }, slots);
}

function BlogItem(props) {
  return View({ p: "md", border: true, d: "flex", flexDirection: "column" }, [
    View({ tag: "h2" }, props.title),
    View(props.content),
  ]);
}

function BlogList() {
  return View([
    View({ tag: "h1" }, "Blog Posts"),
    CollectionList(
      { table: "blogs", d: "flex", gap: "md" },

      CollectionItem({ name: "x" }, [
        BlogItem({
          title: "{x.title}",
          content: "{x.content}",
        }),
      ])
    ),
  ]);
}

const app = express();

const user = {
  name: "Hadi Ahmadi",
  email: "thehadiahmadi@gmail.com",
  username: "thehadiahmadi",
};

app.get("/", (req, res) => {
  const page = AdminLayout({ user }, Dashboard());

  return res.send(page.toHtml());
});

app.get("/users", (req, res) => {
  const page = AdminLayout({ user }, UserList());

  return res.send(page.toHtml());
});

app.get("/blogs", async (req, res) => {
  const page = AdminLayout({ user }, await renderDynamicPage(BlogList()));

  return res.send(page.toHtml());
});

app.get("/blogs/:id", (req, res) => {
  const blog = blogs[+req.params.id - 1];
  const page = AdminLayout(
    { user },
    BlogItem({ title: blog.title, content: blog.content })
  );

  return res.send(page.toHtml());
});

// comes from database and api
const data = {
  todos: [
    {
      title: "first",
      bgColor: "secondary",
      textColor: "light",
      image:
        "https://manage.wix.com/site-thumbnail/305ecea6-e771-43dc-a692-6652ea6cf107?preset=site-details-horizontal&height=268&width=476",
      content: "content of first item",
      padding: "md",
    },
    {
      title: "second",
      bgColor: "success",
      textColor: "secondary",
      image:
        "https://user-images.githubusercontent.com/41773797/198252053-a2ae3314-5076-4383-9d1c-9507362f847f.jpg",
      content: "content of second item",
      padding: "xxs",
    },
  ],
  blogs: [
    {
      title: "item 1",
      content: "content of item 1",
    },
    {
      title: "item 2",
      content: "content of item 2",
    },
  ],
};

app.get("/page", async (req, res) => {
  // this objet can come from database
  const myPage = { 
    name: "todos",
    page: View(
      { d: "flex", flexDirection: "column", gap: "md", border: true, p: "xs" },
      [
        View({ tag: "p" }, "Todo List"),
        View(
          {
            d: "flex",
            flexDirection: "column",
            gap: "md",
            border: true,
            p: "xs",
          },
          [
            CollectionList(
              { table: "todos" },
              [
                CollectionItem(
                  {
                    name: "x",
                  },
                  View(
                    {
                      border: true,
                      bgColor: "{x.bgColor}",
                      textColor: "{x.textColor}",
                      p: "{x.padding}",
                    },
                    [
                      View({
                        tag: "img",
                        w: "100",
                        src: "{x.image}",
                      }),
                      View("{x.title}"),
                      View("{x.content}"),
                    ]
                  )
                ),
              ]
            ),
          ]
        ),
      ]
    ),
  };

  const page = AdminLayout({ user }, await renderDynamicPage(myPage.page));

  return res.send(page.toHtml());
});

app.listen(3000);
