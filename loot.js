/* =========================================================
   WASTELAND — SURVIVAL
   loot.js
   Лут, контейнеры и обыск мира
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       HELPERS
    ===================================================== */

    const player = () =>
        window.Game?.player || null;


    const toast = text => {

        if (
            typeof window.showToast ===
            "function"
        ){

            window.showToast(text);

        }

    };


    const update = () => {

        if (
            typeof window.updateUI ===
            "function"
        ){

            window.updateUI();

        }

    };


    const save = () => {

        if (
            typeof window.saveGame ===
            "function"
        ){

            window.saveGame();

        }

    };


    const random = (
        min,
        max
    ) =>
        Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;


    const distance = (
        a,
        b
    ) => {

        const dx =
            a.x - b.x;

        const dy =
            a.y - b.y;

        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    };


    /* =====================================================
       RARITY
    ===================================================== */

    const RARITY = {

        common: {

            name: "Обычный",

            chance: 60

        },


        uncommon: {

            name: "Необычный",

            chance: 25

        },


        rare: {

            name: "Редкий",

            chance: 10

        },


        epic: {

            name: "Очень редкий",

            chance: 4

        },


        legendary: {

            name: "Ценный",

            chance: 1

        }

    };


    window.LootRarity =
        RARITY;


    /* =====================================================
       LOOT TABLE
    ===================================================== */

    const ITEMS = {

        cloth: {

            id: "cloth",

            name: "Ткань",

            icon: "🧵",

            rarity: "common",

            min: 2,

            max: 8

        },


        wood: {

            id: "wood",

            name: "Дерево",

            icon: "🪵",

            rarity: "common",

            min: 10,

            max: 40

        },


        stone: {

            id: "stone",

            name: "Камень",

            icon: "🪨",

            rarity: "common",

            min: 10,

            max: 35

        },


        metal: {

            id: "metal",

            name: "Металл",

            icon: "⛓️",

            rarity: "uncommon",

            min: 3,

            max: 15

        },


        components: {

            id: "components",

            name: "Компоненты",

            icon: "⚙️",

            rarity: "uncommon",

            min: 1,

            max: 5

        },


        scrap: {

            id: "scrap",

            name: "Металлолом",

            icon: "🔩",

            rarity: "uncommon",

            min: 5,

            max: 35

        },


        sulfur: {

            id: "sulfur",

            name: "Сера",

            icon: "🟡",

            rarity: "rare",

            min: 3,

            max: 15

        },


        leather: {

            id: "leather",

            name: "Кожа",

            icon: "🟫",

            rarity: "uncommon",

            min: 1,

            max: 6

        },


        low_grade_fuel: {

            id: "low_grade_fuel",

            name: "Топливо",

            icon: "⛽",

            rarity: "rare",

            min: 5,

            max: 25

        },


        medkit: {

            id: "medkit",

            name: "Аптечка",

            icon: "🩹",

            rarity: "rare",

            min: 1,

            max: 2

        },


        ammunition: {

            id: "ammunition",

            name: "Боеприпасы",

            icon: "🔸",

            rarity: "rare",

            min: 3,

            max: 12

        },


        rifle: {

            id: "rifle",

            name: "Самодельная винтовка",

            icon: "🔫",

            rarity: "epic",

            min: 1,

            max: 1

        },


        explosive: {

            id: "explosive",

            name: "Взрывчатка",

            icon: "💣",

            rarity: "legendary",

            min: 1,

            max: 1

        }

    };


    window.LootItems =
        ITEMS;


    /* =====================================================
       CONTAINER TYPES
    ===================================================== */

    const CONTAINERS = {

        barrel: {

            name: "Бочка",

            icon: "🛢️",

            rolls: [1, 2],

            table: [

                "cloth",

                "wood",

                "metal",

                "components",

                "scrap"

            ]

        },


        crate: {

            name: "Ящик",

            icon: "📦",

            rolls: [2, 3],

            table: [

                "cloth",

                "metal",

                "components",

                "scrap",

                "leather",

                "low_grade_fuel"

            ]

        },


        military: {

            name: "Военный ящик",

            icon: "🪖",

            rolls: [2, 4],

            table: [

                "metal",

                "components",

                "scrap",

                "ammunition",

                "medkit",

                "rifle"

            ]

        },


        elite: {

            name: "Элитный контейнер",

            icon: "💎",

            rolls: [3, 5],

            table: [

                "components",

                "scrap",

                "ammunition",

                "medkit",

                "rifle",

                "explosive"

            ]

        }

    };


    window.LootContainers =
        CONTAINERS;


    /* =====================================================
       LOOT STATE
    ===================================================== */

    const LootState = {

        containers: [],

        opened: new Set(),

        selected: null

    };


    window.LootState =
        LootState;


    /* =====================================================
       LOOT API
    ===================================================== */

    window.LootSystem = {


        /* -------------------------------------------------
           CREATE CONTAINER
        ------------------------------------------------- */

        spawn(
            type = "crate",
            x = 0,
            y = 0
        ){

            const template =
                CONTAINERS[type];


            if(!template){

                toast(
                    "❌ Тип контейнера не найден"
                );

                return null;

            }


            const container = {

                id:
                    `loot_${Date.now()}_${random(1,9999)}`,

                type,

                name:
                    template.name,

                icon:
                    template.icon,

                x:
                    Number(x),

                y:
                    Number(y),

                opened:
                    false

            };


            LootState.containers.push(
                container
            );


            render();


            return container;

        },


        /* -------------------------------------------------
           OPEN CONTAINER
        ------------------------------------------------- */

        open(
            containerId
        ){

            const p =
                player();


            if(!p){

                return false;

            }


            const container =
                LootState.containers.find(
                    item =>
                        item.id ===
                        containerId
                );


            if(!container){

                toast(
                    "❌ Контейнер не найден"
                );

                return false;

            }


            if(container.opened){

                toast(
                    "📦 Здесь уже всё забрали"
                );

                return false;

            }


            const dist =
                distance(
                    {
                        x:
                            p.position?.x || 0,

                        y:
                            p.position?.y || 0
                    },
                    container
                );


            if(
                dist > 25
            ){

                toast(
                    `📍 Подойди ближе: ${Math.round(dist)} м`
                );

                return false;

            }


            const template =
                CONTAINERS[
                    container.type
                ];


            const rolls =
                random(
                    template.rolls[0],
                    template.rolls[1]
                );


            const drops = [];


            for(
                let i = 0;
                i < rolls;
                i++
            ){

                const itemId =
                    template.table[
                        random(
                            0,
                            template.table.length - 1
                        )
                    ];


                const item =
                    ITEMS[itemId];


                if(!item)
                    continue;


                /*
                   Небольшой шанс повысить
                   редкость предмета.
                */

                let rarity =
                    item.rarity;


                if(
                    Math.random() < 0.03 &&
                    rarity === "common"
                ){

                    rarity =
                        "uncommon";

                }


                const amount =
                    random(
                        item.min,
                        item.max
                    );


                addLoot(
                    itemId,
                    amount,
                    p
                );


                drops.push({

                    id:
                        itemId,

                    name:
                        item.name,

                    icon:
                        item.icon,

                    amount,

                    rarity

                });

            }


            container.opened =
                true;


            LootState.opened.add(
                container.id
            );


            LootState.selected =
                container;


            showLoot(
                container,
                drops
            );


            if(window.addEvent){

                addEvent(
                    "📦",
                    "Обыск",
                    `${container.name}: ${drops.map(
                        d =>
                            `${d.icon} ${d.name} ×${d.amount}`
                    ).join(", ")}`
                );

            }


            toast(
                `📦 ${container.name} обыскан`
            );


            update();

            save();

            render();


            return drops;

        },


        /* -------------------------------------------------
           NEAREST CONTAINER
        ------------------------------------------------- */

        nearest(
            radius = 25
        ){

            const p =
                player();


            if(!p)
                return null;


            const position = {

                x:
                    p.position?.x || 0,

                y:
                    p.position?.y || 0

            };


            let result =
                null;

            let min =
                Infinity;


            LootState.containers
                .filter(
                    c =>
                        !c.opened
                )
                .forEach(
                    container => {

                        const d =
                            distance(
                                position,
                                container
                            );


                        if(
                            d <= radius &&
                            d < min
                        ){

                            min =
                                d;

                            result =
                                container;

                        }

                    }
                );


            return result;

        },


        /* -------------------------------------------------
           OPEN NEAREST
        ------------------------------------------------- */

        openNearest(){

            const container =
                this.nearest();


            if(!container){

                toast(
                    "📦 Рядом нет контейнеров"
                );

                return false;

            }


            return this.open(
                container.id
            );

        },


        /* -------------------------------------------------
           SPAWN AREA
        ------------------------------------------------- */

        generate(
            count = 30
        ){

            LootState.containers =
                [];


            const types =
                Object.keys(
                    CONTAINERS
                );


            for(
                let i = 0;
                i < count;
                i++
            ){

                const type =
                    types[
                        random(
                            0,
                            types.length - 1
                        )
                    ];


                this.spawn(

                    type,

                    random(
                        -450,
                        450
                    ),

                    random(
                        -450,
                        450
                    )

                );

            }


            render();

        }

    };


    /* =====================================================
       ADD LOOT TO PLAYER
    ===================================================== */

    function addLoot(
        itemId,
        amount,
        p
    ){

        /*
           Scrap и базовые ресурсы
           можно хранить прямо в игроке.
        */

        const directResources = [

            "wood",

            "stone",

            "metal",

            "sulfur",

            "scrap",

            "cloth",

            "leather"

        ];


        if(
            directResources.includes(
                itemId
            )
        ){

            p[itemId] =
                Number(
                    p[itemId] || 0
                ) +
                amount;

            return;

        }


        /*
           Остальное идёт
           в инвентарь.
        */

        if(
            window.Inventory?.add
        ){

            Inventory.add(
                itemId,
                amount
            );

        }

    }


    /* =====================================================
       LOOT WINDOW
    ===================================================== */

    function showLoot(
        container,
        drops
    ){

        const existing =
            document.querySelector(
                ".loot-window"
            );


        if(existing)
            existing.remove();


        const windowElement =
            document.createElement(
                "div"
            );


        windowElement.className =
            "loot-window";


        windowElement.innerHTML = `

            <div class="loot-panel">

                <div class="loot-header">

                    <div>
                        ${container.icon}
                        ${container.name}
                    </div>

                    <button
                        type="button"
                        data-loot-close
                    >
                        ×
                    </button>

                </div>

                <div class="loot-items">

                    ${
                        drops.length
                            ? drops.map(
                                drop => `

                                    <div
                                        class="
                                            loot-item
                                            rarity-${drop.rarity}
                                        "
                                    >

                                        <span
                                            class="loot-icon"
                                        >
                                            ${drop.icon}
                                        </span>

                                        <span
                                            class="loot-name"
                                        >
                                            ${drop.name}
                                        </span>

                                        <b>
                                            ×${drop.amount}
                                        </b>

                                        <small>
                                            ${
                                                RARITY[
                                                    drop.rarity
                                                ]?.name ||
                                                ""
                                            }
                                        </small>

                                    </div>

                                `
                            ).join("")
                            :
                            `
                                <div>
                                    Контейнер пуст.
                                </div>
                            `
                    }

                </div>

                <button
                    type="button"
                    class="loot-close"
                    data-loot-close
                >
                    ЗАБРАТЬ
                </button>

            </div>

        `;


        document.body.appendChild(
            windowElement
        );


        windowElement
            .querySelectorAll(
                "[data-loot-close]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            windowElement.remove();

                        }
                    );

                }
            );

    }


    /* =====================================================
       RANDOM WORLD LOOT
    ===================================================== */

    function generateWorldLoot(){

        const map =
            window.MapSystem;


        if(!map)
            return;


        /*
           Создаём контейнеры
           возле памятников.
        */

        if(
            Array.isArray(
                window.MapMonuments
            )
        ){

            window.MapMonuments.forEach(
                monument => {

                    const amount =
                        random(
                            2,
                            5
                        );


                    for(
                        let i = 0;
                        i < amount;
                        i++
                    ){

                        let type =
                            "crate";


                        if(
                            monument.danger >= 7
                        ){

                            type =
                                Math.random() <
                                0.4
                                    ? "military"
                                    : "elite";

                        }

                        else if(
                            monument.danger >= 4
                        ){

                            type =
                                Math.random() <
                                0.35
                                    ? "military"
                                    : "crate";

                        }


                        LootSystem.spawn(

                            type,

                            monument.x +
                            random(-25,25),

                            monument.y +
                            random(-25,25)

                        );

                    }

                }
            );

        }

    }


    /* =====================================================
       LOOT UI
    ===================================================== */

    function render(){

        const container =
            document.querySelector(
                ".loot-containers"
            );


        if(!container)
            return;


        container.innerHTML = "";


        LootState.containers
            .filter(
                loot =>
                    !loot.opened
            )
            .forEach(
                loot => {

                    const element =
                        document.createElement(
                            "button"
                        );


                    element.type =
                        "button";


                    element.className =
                        "loot-container";


                    element.innerHTML = `

                        <span>
                            ${loot.icon}
                        </span>

                        <small>
                            ${loot.name}
                        </small>

                    `;


                    element.addEventListener(
                        "click",
                        () => {

                            LootSystem.open(
                                loot.id
                            );

                        }
                    );


                    container.appendChild(
                        element
                    );

                }
            );

    }


    /* =====================================================
       BUTTONS
    ===================================================== */

    function setupButtons(){

        document
            .querySelectorAll(
                "[data-open-loot]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            LootSystem.openNearest();

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-spawn-loot]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            LootSystem.spawn(
                                button.dataset.spawnLoot,

                                player()?.position?.x ||
                                0,

                                player()?.position?.y ||
                                0

                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       TEST BUTTONS
    ===================================================== */

    window.spawnCrate =
        () =>
            LootSystem.spawn(
                "crate",
                player()?.position?.x || 0,
                player()?.position?.y || 0
            );


    window.spawnBarrel =
        () =>
            LootSystem.spawn(
                "barrel",
                player()?.position?.x || 0,
                player()?.position?.y || 0
            );


    window.spawnMilitaryCrate =
        () =>
            LootSystem.spawn(
                "military",
                player()?.position?.x || 0,
                player()?.position?.y || 0
            );


    /* =====================================================
       INIT
    ===================================================== */

    function init(){

        /*
           Генерируем мир только если
           контейнеров ещё нет.
        */

        if(
            LootState.containers.length === 0
        ){

            generateWorldLoot();

        }


        setupButtons();

        render();

    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                init,
                450
            );

        }
    );


    if(
        document.readyState !==
        "loading"
    ){

        setTimeout(
            init,
            450
        );

    }


})();
