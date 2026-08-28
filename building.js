/* =========================================================
   WASTELAND — BUILDING SYSTEM
   building.js
   Rust-style строительство
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       SETTINGS
    ===================================================== */

    const BUILD_DISTANCE = 80;

    const GRID = 40;

    const START_WOOD = 500;

    const START_STONE = 250;

    const START_METAL = 100;


    /* =====================================================
       PLAYER
    ===================================================== */

    const getPlayer = () =>
        window.Game?.player || null;


    const toast = text => {

        if (
            typeof window.showToast ===
            "function"
        ){

            window.showToast(text);

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


    const update = () => {

        if (
            typeof window.updateUI ===
            "function"
        ){

            window.updateUI();

        }

    };


    /* =====================================================
       BUILDING PIECES
    ===================================================== */

    const PIECES = {

        foundation: {

            id: "foundation",

            name: "Фундамент",

            icon: "⬜",

            cost: {

                wood: 100

            },

            hp: 500

        },


        wall: {

            id: "wall",

            name: "Стена",

            icon: "🧱",

            cost: {

                wood: 50

            },

            hp: 350

        },


        doorway: {

            id: "doorway",

            name: "Дверной проём",

            icon: "🚪",

            cost: {

                wood: 75

            },

            hp: 350

        },


        window: {

            id: "window",

            name: "Оконная стена",

            icon: "🪟",

            cost: {

                wood: 60

            },

            hp: 300

        },


        floor: {

            id: "floor",

            name: "Пол",

            icon: "🟫",

            cost: {

                wood: 75

            },

            hp: 400

        },


        roof: {

            id: "roof",

            name: "Крыша",

            icon: "🔺",

            cost: {

                wood: 75

            },

            hp: 400

        },


        stairs: {

            id: "stairs",

            name: "Лестница",

            icon: "🪜",

            cost: {

                wood: 100

            },

            hp: 300

        },


        foundation_stone: {

            id: "foundation_stone",

            name: "Каменный фундамент",

            icon: "⬛",

            cost: {

                stone: 150

            },

            hp: 1000

        },


        wall_stone: {

            id: "wall_stone",

            name: "Каменная стена",

            icon: "🪨",

            cost: {

                stone: 100

            },

            hp: 750

        },


        wall_metal: {

            id: "wall_metal",

            name: "Металлическая стена",

            icon: "🔩",

            cost: {

                metal: 50

            },

            hp: 1250

        },


        door: {

            id: "door",

            name: "Деревянная дверь",

            icon: "🚪",

            cost: {

                wood: 100

            },

            hp: 400

        }

    };


    window.BuildingPieces =
        PIECES;


    /* =====================================================
       STATE
    ===================================================== */

    const BuildingState = {

        selected:

            "foundation",

        mode:

            false,

        rotation:

            0,

        structures:

            [],

        preview:

            null

    };


    window.BuildingState =
        BuildingState;


    /* =====================================================
       RESOURCE HELPERS
    ===================================================== */

    function hasResources(
        cost
    ){

        const p =
            getPlayer();


        if(!p)
            return false;


        return Object.entries(
            cost
        ).every(
            ([resource, amount]) =>
                Number(
                    p[resource] || 0
                ) >= amount
        );

    }


    function takeResources(
        cost
    ){

        const p =
            getPlayer();


        if(!p)
            return false;


        if(
            !hasResources(cost)
        ){

            return false;

        }


        Object.entries(
            cost
        ).forEach(
            ([resource, amount]) => {

                p[resource] =
                    Number(
                        p[resource] || 0
                    ) -
                    amount;

            }
        );


        update();

        save();


        return true;

    }


    /* =====================================================
       POSITION
    ===================================================== */

    function getPosition(){

        const p =
            getPlayer();


        if(!p)
            return {

                x: 0,

                y: 0

            };


        return {

            x:
                Number(
                    p.position?.x || 0
                ),

            y:
                Number(
                    p.position?.y || 0
                )

        };

    }


    function snap(
        value
    ){

        return Math.round(
            value / GRID
        ) * GRID;

    }


    function getBuildPosition(){

        const p =
            getPosition();


        const angle =
            Number(
                p.rotation || 0
            );


        const radians =
            angle *
            Math.PI /
            180;


        return {

            x:
                snap(
                    p.x +
                    Math.cos(
                        radians
                    ) *
                    GRID
                ),

            y:
                snap(
                    p.y +
                    Math.sin(
                        radians
                    ) *
                    GRID
                )

        };

    }


    /* =====================================================
       COLLISION
    ===================================================== */

    function occupied(
        position
    ){

        return BuildingState
            .structures
            .some(
                structure => {

                    const dx =
                        structure.x -
                        position.x;

                    const dy =
                        structure.y -
                        position.y;

                    return Math.sqrt(
                        dx * dx +
                        dy * dy
                    ) < GRID * 0.7;

                }
            );

    }


    /* =====================================================
       BUILDING API
    ===================================================== */

    window.BuildingSystem = {


        /* -------------------------------------------------
           SELECT
        ------------------------------------------------- */

        select(
            type
        ){

            if(
                !PIECES[type]
            ){

                toast(
                    "❌ Такой элемент не существует"
                );

                return false;

            }


            BuildingState.selected =
                type;


            BuildingState.mode =
                true;


            toast(
                `${PIECES[type].icon} ${PIECES[type].name}`
            );


            render();

            return true;

        },


        /* -------------------------------------------------
           ROTATE
        ------------------------------------------------- */

        rotate(){

            BuildingState.rotation =
                (
                    BuildingState.rotation +
                    90
                ) %
                360;


            render();

        },


        /* -------------------------------------------------
           BUILD
        ------------------------------------------------- */

        build(){

            const p =
                getPlayer();


            if(!p){

                toast(
                    "❌ Игрок не найден"
                );

                return false;

            }


            const type =
                BuildingState.selected;


            const piece =
                PIECES[type];


            if(!piece){

                return false;

            }


            const position =
                getBuildPosition();


            /*
               Проверка расстояния
            */

            const playerPosition =
                getPosition();


            const dx =
                position.x -
                playerPosition.x;

            const dy =
                position.y -
                playerPosition.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if(
                distance >
                BUILD_DISTANCE
            ){

                toast(
                    "📍 Слишком далеко"
                );

                return false;

            }


            /*
               Проверка занятой клетки
            */

            if(
                occupied(position)
            ){

                toast(
                    "🚫 Здесь уже что-то построено"
                );

                return false;

            }


            /*
               Проверка ресурсов
            */

            if(
                !hasResources(
                    piece.cost
                )
            ){

                const missing =
                    Object.entries(
                        piece.cost
                    )
                    .filter(
                        ([resource, amount]) =>
                            Number(
                                p[resource] || 0
                            ) <
                            amount
                    )
                    .map(
                        ([resource, amount]) =>
                            `${resource}: ${
                                Math.max(
                                    0,
                                    amount -
                                    Number(
                                        p[resource] ||
                                        0
                                    )
                                )
                            }`
                    )
                    .join(", ");


                toast(
                    `❌ Не хватает: ${missing}`
                );

                return false;

            }


            /*
               Списание ресурсов
            */

            if(
                !takeResources(
                    piece.cost
                )
            ){

                return false;

            }


            /*
               Создание объекта
            */

            const structure = {

                id:
                    `building_${Date.now()}_${Math.floor(
                        Math.random() * 9999
                    )}`,

                type,

                name:
                    piece.name,

                x:
                    position.x,

                y:
                    position.y,

                rotation:
                    BuildingState.rotation,

                hp:
                    piece.hp,

                maxHp:
                    piece.hp,

                owner:
                    "player",

                level:
                    1,

                created:
                    Date.now()

            };


            BuildingState
                .structures
                .push(
                    structure
                );


            toast(
                `🔨 Построено: ${piece.name}`
            );


            if(
                typeof window.addEvent ===
                "function"
            ){

                addEvent(
                    "🔨",
                    "Строительство",
                    piece.name
                );

            }


            save();

            update();

            render();


            return structure;

        },


        /* -------------------------------------------------
           DEMOLISH
        ------------------------------------------------- */

        demolish(
            id
        ){

            const index =
                BuildingState
                    .structures
                    .findIndex(
                        structure =>
                            structure.id ===
                            id
                    );


            if(
                index === -1
            ){

                return false;

            }


            const structure =
                BuildingState
                    .structures[index];


            /*
               Возвращаем часть ресурсов.
            */

            const piece =
                PIECES[
                    structure.type
                ];


            const p =
                getPlayer();


            if(
                p &&
                piece
            ){

                Object.entries(
                    piece.cost
                ).forEach(
                    ([resource, amount]) => {

                        p[resource] =
                            Number(
                                p[resource] || 0
                            ) +
                            Math.floor(
                                amount * 0.5
                            );

                    }
                );

            }


            BuildingState
                .structures
                .splice(
                    index,
                    1
                );


            toast(
                "🔨 Постройка разобрана"
            );


            save();

            update();

            render();


            return true;

        },


        /* -------------------------------------------------
           DAMAGE
        ------------------------------------------------- */

        damage(
            id,
            amount
        ){

            const structure =
                BuildingState
                    .structures
                    .find(
                        item =>
                            item.id === id
                    );


            if(!structure)
                return false;


            structure.hp =
                Math.max(
                    0,
                    structure.hp -
                    Number(amount || 0)
                );


            if(
                structure.hp <= 0
            ){

                const index =
                    BuildingState
                        .structures
                        .indexOf(
                            structure
                        );


                if(index !== -1){

                    BuildingState
                        .structures
                        .splice(
                            index,
                            1
                        );

                }


                toast(
                    "💥 Постройка разрушена"
                );

            }


            save();

            render();

            return true;

        },


        /* -------------------------------------------------
           REPAIR
        ------------------------------------------------- */

        repair(
            id
        ){

            const structure =
                BuildingState
                    .structures
                    .find(
                        item =>
                            item.id === id
                    );


            if(!structure)
                return false;


            if(
                structure.hp >=
                structure.maxHp
            ){

                toast(
                    "🔧 Постройка уже цела"
                );

                return false;

            }


            const piece =
                PIECES[
                    structure.type
                ];


            const repairCost = {};


            Object.entries(
                piece.cost
            ).forEach(
                ([resource, amount]) => {

                    repairCost[resource] =
                        Math.ceil(
                            amount * 0.25
                        );

                }
            );


            if(
                !takeResources(
                    repairCost
                )
            ){

                toast(
                    "❌ Не хватает ресурсов на ремонт"
                );

                return false;

            }


            structure.hp =
                Math.min(
                    structure.maxHp,
                    structure.hp +
                    Math.ceil(
                        structure.maxHp *
                        0.5
                    )
                );


            toast(
                "🔧 Постройка отремонтирована"
            );


            save();

            render();


            return true;

        },


        /* -------------------------------------------------
           GET STRUCTURES
        ------------------------------------------------- */

        getAll(){

            return [
                ...BuildingState
                    .structures
            ];

        },


        /* -------------------------------------------------
           GET NEAREST
        ------------------------------------------------- */

        nearest(
            radius = 100
        ){

            const position =
                getPosition();


            let nearest =
                null;

            let nearestDistance =
                Infinity;


            BuildingState
                .structures
                .forEach(
                    structure => {

                        const dx =
                            structure.x -
                            position.x;

                        const dy =
                            structure.y -
                            position.y;


                        const distance =
                            Math.sqrt(
                                dx * dx +
                                dy * dy
                            );


                        if(
                            distance <= radius &&
                            distance <
                            nearestDistance
                        ){

                            nearest =
                                structure;

                            nearestDistance =
                                distance;

                        }

                    }
                );


            return nearest;

        },


        /* -------------------------------------------------
           EXIT BUILD MODE
        ------------------------------------------------- */

        cancel(){

            BuildingState.mode =
                false;


            BuildingState.preview =
                null;


            render();

        }

    };


    /* =====================================================
       BUILDING UI
    ===================================================== */

    function render(){

        const panel =
            document.querySelector(
                ".building-panel"
            );


        if(!panel)
            return;


        panel.innerHTML = `

            <div class="building-title">
                🔨 СТРОИТЕЛЬСТВО
            </div>

            <div class="building-items">

                ${
                    Object.values(
                        PIECES
                    )
                    .map(
                        piece => `

                            <button
                                type="button"
                                class="
                                    build-item
                                    ${
                                        BuildingState.selected ===
                                        piece.id
                                            ? "active"
                                            : ""
                                    }
                                "
                                data-build="${piece.id}"
                            >

                                <span>
                                    ${piece.icon}
                                </span>

                                <b>
                                    ${piece.name}
                                </b>

                                <small>

                                    ${
                                        Object.entries(
                                            piece.cost
                                        )
                                        .map(
                                            ([r, n]) =>
                                                `${r} ${n}`
                                        )
                                        .join(" · ")
                                    }

                                </small>

                            </button>

                        `
                    )
                    .join("")
                }

            </div>

            <div class="building-actions">

                <button
                    type="button"
                    data-build-rotate
                >
                    🔄 ПОВОРОТ
                </button>

                <button
                    type="button"
                    data-build-place
                >
                    🔨 ПОСТРОИТЬ
                </button>

                <button
                    type="button"
                    data-build-cancel
                >
                    ✕ ОТМЕНА
                </button>

            </div>

        `;


        panel
            .querySelectorAll(
                "[data-build]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            BuildingSystem.select(
                                button.dataset.build
                            );

                        }
                    );

                }
            );


        const rotate =
            panel.querySelector(
                "[data-build-rotate]"
            );


        if(rotate){

            rotate.onclick =
                () =>
                    BuildingSystem.rotate();

        }


        const place =
            panel.querySelector(
                "[data-build-place]"
            );


        if(place){

            place.onclick =
                () =>
                    BuildingSystem.build();

        }


        const cancel =
            panel.querySelector(
                "[data-build-cancel]"
            );


        if(cancel){

            cancel.onclick =
                () =>
                    BuildingSystem.cancel();

        }

    }


    /* =====================================================
       KEYBOARD
    ===================================================== */

    function keyboard(){

        document.addEventListener(
            "keydown",
            event => {

                /*
                   B — строительство
                */

                if(
                    event.key.toLowerCase() ===
                    "b"
                ){

                    BuildingState.mode =
                        !BuildingState.mode;


                    render();

                }


                /*
                   R — поворот
                */

                if(
                    event.key.toLowerCase() ===
                    "r" &&
                    BuildingState.mode
                ){

                    BuildingSystem.rotate();

                }


                /*
                   ЛКМ — строительство
                */

                if(
                    event.code ===
                    "Space" &&
                    BuildingState.mode
                ){

                    event.preventDefault();

                    BuildingSystem.build();

                }


                /*
                   Escape
                */

                if(
                    event.key ===
                    "Escape"
                ){

                    BuildingSystem.cancel();

                }

            }
        );

    }


    /* =====================================================
       TEST STARTER
    ===================================================== */

    function giveStarterResources(){

        const p =
            getPlayer();


        if(!p)
            return;


        if(
            typeof p.wood !==
            "number"
        ){

            p.wood =
                START_WOOD;

        }


        if(
            typeof p.stone !==
            "number"
        ){

            p.stone =
                START_STONE;

        }


        if(
            typeof p.metal !==
            "number"
        ){

            p.metal =
                START_METAL;

        }

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init(){

        giveStarterResources();

        keyboard();

        render();

        update();

    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                init,
                400
            );

        }
    );


    if(
        document.readyState !==
        "loading"
    ){

        setTimeout(
            init,
            400
        );

    }

})();
