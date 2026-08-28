/* =========================================================
   WASTELAND — SURVIVAL
   map.js
   Карта и мир
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       HELPERS
    ===================================================== */

    const player = () =>
        window.Game?.player || null;


    const toast = text => {

        if (typeof window.showToast === "function")
            window.showToast(text);

    };


    const save = () => {

        if (typeof window.saveGame === "function")
            window.saveGame();

    };


    const update = () => {

        if (typeof window.updateUI === "function")
            window.updateUI();

    };


    const random = (min, max) =>
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
       WORLD SETTINGS
    ===================================================== */

    const WORLD = {

        width: 1000,

        height: 1000,

        tile: 10,

        spawn: {

            x: 0,

            y: 0

        }

    };


    window.WorldSettings =
        WORLD;


    /* =====================================================
       ZONES
    ===================================================== */

    const ZONES = [

        {
            id: "safe",

            name: "Безопасная территория",

            icon: "🟢",

            minX: -120,

            maxX: 120,

            minY: -120,

            maxY: 120,

            danger: 0,

            radiation: 0,

            resourceBonus: 0

        },


        {
            id: "forest",

            name: "Лес",

            icon: "🌲",

            minX: -350,

            maxX: 350,

            minY: 120,

            maxY: 450,

            danger: 1,

            radiation: 0,

            resourceBonus: 25

        },


        {
            id: "quarry",

            name: "Каменистая местность",

            icon: "⛰️",

            minX: 180,

            maxX: 500,

            minY: -450,

            maxY: -100,

            danger: 2,

            radiation: 0,

            resourceBonus: 35

        },


        {
            id: "desert",

            name: "Пустошь",

            icon: "🏜️",

            minX: -500,

            maxX: -180,

            minY: -450,

            maxY: -100,

            danger: 2,

            radiation: 0,

            resourceBonus: 15

        },


        {
            id: "industrial",

            name: "Промышленная зона",

            icon: "🏭",

            minX: 180,

            maxX: 500,

            minY: 100,

            maxY: 450,

            danger: 4,

            radiation: 5,

            resourceBonus: 55

        },


        {
            id: "radiation",

            name: "Радиационная зона",

            icon: "☢️",

            minX: -500,

            maxX: -180,

            minY: 100,

            maxY: 450,

            danger: 6,

            radiation: 35,

            resourceBonus: 80

        }

    ];


    window.MapZones =
        ZONES;


    /* =====================================================
       MONUMENTS
    ===================================================== */

    const MONUMENTS = [

        {
            id: "gas_station",

            name: "Заправка",

            icon: "⛽",

            x: 260,

            y: 260,

            danger: 3,

            loot: true

        },


        {
            id: "supermarket",

            name: "Супермаркет",

            icon: "🏪",

            x: -270,

            y: 280,

            danger: 3,

            loot: true

        },


        {
            id: "warehouse",

            name: "Склад",

            icon: "🏢",

            x: 350,

            y: 330,

            danger: 5,

            loot: true

        },


        {
            id: "military",

            name: "Военная база",

            icon: "🏚️",

            x: -350,

            y: 300,

            danger: 8,

            loot: true

        },


        {
            id: "quarry",

            name: "Карьер",

            icon: "⛏️",

            x: 330,

            y: -280,

            danger: 4,

            loot: true

        },


        {
            id: "airfield",

            name: "Аэродром",

            icon: "✈️",

            x: -330,

            y: -280,

            danger: 7,

            loot: true

        }

    ];


    window.MapMonuments =
        MONUMENTS;


    /* =====================================================
       RESOURCE NODES
    ===================================================== */

    const RESOURCE_TYPES = {

        tree: {

            name: "Дерево",

            icon: "🌲",

            resource: "wood",

            amount: [20, 60]

        },


        rock: {

            name: "Камень",

            icon: "🪨",

            resource: "stone",

            amount: [15, 50]

        },


        metal: {

            name: "Металлическая руда",

            icon: "⛓️",

            resource: "metal",

            amount: [5, 20]

        },


        sulfur: {

            name: "Сера",

            icon: "🟡",

            resource: "sulfur",

            amount: [5, 18]

        }


    };


    const resourceNodes = [];


    /* =====================================================
       MAP STATE
    ===================================================== */

    const MapState = {

        discovered: new Set(),

        resources: resourceNodes,

        lastMove: 0,

        moveCooldown: 300,

        selectedZone: null

    };


    window.MapState =
        MapState;


    /* =====================================================
       MAP API
    ===================================================== */

    window.MapSystem = {


        /* -------------------------------------------------
           POSITION
        ------------------------------------------------- */

        getPosition(){

            const p =
                player();

            if(!p)
                return {
                    x: 0,
                    y: 0
                };


            if(!p.position){

                p.position = {

                    x: WORLD.spawn.x,

                    y: WORLD.spawn.y

                };

            }


            return {

                x:
                    Number(
                        p.position.x || 0
                    ),

                y:
                    Number(
                        p.position.y || 0
                    )

            };

        },


        /* -------------------------------------------------
           SET POSITION
        ------------------------------------------------- */

        setPosition(
            x,
            y
        ){

            const p =
                player();

            if(!p)
                return false;


            p.position = {

                x:
                    Number(x),

                y:
                    Number(y)

            };


            this.discover();


            update();

            save();

            render();


            return true;

        },


        /* -------------------------------------------------
           MOVE
        ------------------------------------------------- */

        move(
            dx,
            dy
        ){

            const p =
                player();

            if(!p)
                return false;


            const now =
                Date.now();


            if(
                now -
                MapState.lastMove <
                WORLD.tile *
                10
            ){

                return false;

            }


            MapState.lastMove =
                now;


            const position =
                this.getPosition();


            const speed =
                Number(
                    p.speed || 10
                );


            const nx =
                position.x +
                dx *
                speed;


            const ny =
                position.y +
                dy *
                speed;


            /*
               Ограничиваем мир.
            */

            p.position.x =
                Math.max(
                    -WORLD.width / 2,
                    Math.min(
                        WORLD.width / 2,
                        nx
                    )
                );


            p.position.y =
                Math.max(
                    -WORLD.height / 2,
                    Math.min(
                        WORLD.height / 2,
                        ny
                    )
                );


            this.discover();

            checkZoneEffects();

            update();

            save();

            render();


            return true;

        },


        /* -------------------------------------------------
           TRAVEL
        ------------------------------------------------- */

        travel(
            x,
            y
        ){

            const p =
                player();

            if(!p)
                return false;


            const current =
                this.getPosition();


            const target = {

                x:
                    Number(x),

                y:
                    Number(y)

            };


            const dist =
                distance(
                    current,
                    target
                );


            /*
               Дальняя поездка расходует энергию.
            */

            const energyCost =
                Math.max(
                    1,
                    Math.ceil(
                        dist / 50
                    )
                );


            if(
                window.Player?.useEnergy
            ){

                if(
                    !Player.useEnergy(
                        energyCost
                    )
                ){

                    return false;

                }

            }


            p.position = target;


            this.discover();

            checkZoneEffects();


            toast(
                `🧭 Перемещение: ${Math.round(target.x)}, ${Math.round(target.y)}`
            );


            update();

            save();

            render();


            return true;

        },


        /* -------------------------------------------------
           GET ZONE
        ------------------------------------------------- */

        getZone(){

            const pos =
                this.getPosition();


            return ZONES.find(
                zone =>

                    pos.x >= zone.minX &&
                    pos.x <= zone.maxX &&

                    pos.y >= zone.minY &&
                    pos.y <= zone.maxY

            ) || {

                id: "wilderness",

                name: "Дикая местность",

                icon: "🌿",

                danger: 2,

                radiation: 0,

                resourceBonus: 10

            };

        },


        /* -------------------------------------------------
           GET MONUMENT
        ------------------------------------------------- */

        getNearestMonument(){

            const pos =
                this.getPosition();


            let nearest =
                null;

            let min =
                Infinity;


            MONUMENTS.forEach(
                monument => {

                    const dist =
                        distance(
                            pos,
                            monument
                        );


                    if(
                        dist < min
                    ){

                        min =
                            dist;

                        nearest =
                            monument;

                    }

                }
            );


            return nearest
                ? {
                    ...nearest,
                    distance: min
                }
                : null;

        },


        /* -------------------------------------------------
           DISCOVER
        ------------------------------------------------- */

        discover(){

            const pos =
                this.getPosition();


            const zone =
                this.getZone();


            if(
                !MapState.discovered.has(
                    zone.id
                )
            ){

                MapState.discovered.add(
                    zone.id
                );


                toast(
                    `${zone.icon} Обнаружена зона: ${zone.name}`
                );


                if(window.addEvent){

                    addEvent(
                        "🗺️",
                        "Исследование",
                        zone.name
                    );

                }

            }


            /*
               Открываем ближайший монумент,
               если подошли достаточно близко.
            */

            MONUMENTS.forEach(
                monument => {

                    const dist =
                        distance(
                            pos,
                            monument
                        );


                    if(
                        dist <= 30 &&
                        !MapState.discovered.has(
                            monument.id
                        )
                    ){

                        MapState.discovered.add(
                            monument.id
                        );


                        toast(
                            `${monument.icon} Найден объект: ${monument.name}`
                        );


                        if(window.addEvent){

                            addEvent(
                                "📍",
                                "Объект найден",
                                monument.name
                            );

                        }

                    }

                }
            );

        },


        /* -------------------------------------------------
           SEARCH MONUMENT
        ------------------------------------------------- */

        searchMonument(
            monumentId
        ){

            const monument =
                MONUMENTS.find(
                    item =>
                        item.id ===
                        monumentId
                );


            if(!monument){

                toast(
                    "❌ Объект не найден"
                );

                return false;

            }


            const pos =
                this.getPosition();


            const dist =
                distance(
                    pos,
                    monument
                );


            if(dist > 40){

                toast(
                    `📍 Подойди ближе: ${Math.round(dist)} м`
                );

                return false;

            }


            if(
                !monument.loot
            ){

                toast(
                    "Здесь нечего искать"
                );

                return false;

            }


            /*
               Случайный лут.
            */

            const p =
                player();


            if(!p)
                return false;


            const lootTable = [

                ["scrap", random(5,25)],

                ["components", random(1,5)],

                ["cloth", random(2,8)]

            ];


            const drops =
                lootTable[
                    random(
                        0,
                        lootTable.length - 1
                    )
                ];


            const item =
                drops[0];


            const amount =
                drops[1];


            if(item === "scrap"){

                p.scrap =
                    Number(
                        p.scrap || 0
                    ) +
                    amount;

            }

            else if(
                window.Inventory?.add
            ){

                Inventory.add(
                    item,
                    amount
                );

            }


            toast(
                `📦 Найдено: ${item} ×${amount}`
            );


            if(window.addEvent){

                addEvent(
                    "📦",
                    "Обыск",
                    `${monument.name}: ${item} ×${amount}`
                );

            }


            monument.loot =
                false;


            update();

            save();


            return true;

        },


        /* -------------------------------------------------
           GATHER RESOURCE
        ------------------------------------------------- */

        gather(
            type
        ){

            const resource =
                RESOURCE_TYPES[type];


            if(!resource){

                toast(
                    "❌ Ресурс не найден"
                );

                return false;

            }


            const p =
                player();

            if(!p)
                return false;


            const zone =
                this.getZone();


            const bonus =
                1 +
                (
                    zone.resourceBonus /
                    100
                );


            const amount =
                Math.max(
                    1,
                    Math.round(
                        random(
                            resource.amount[0],
                            resource.amount[1]
                        ) *
                        bonus
                    )
                );


            /*
               Энергия.
            */

            if(
                window.Player?.useEnergy
            ){

                if(
                    !Player.useEnergy(
                        3
                    )
                ){

                    return false;

                }

            }


            /*
               Добавляем ресурс.
            */

            if(
                resource.resource in p
            ){

                p[
                    resource.resource
                ] =
                    Number(
                        p[
                            resource.resource
                        ] || 0
                    ) +
                    amount;

            }

            else if(
                window.Inventory?.add
            ){

                Inventory.add(
                    resource.resource,
                    amount
                );

            }


            toast(
                `${resource.icon} ${resource.name} +${amount}`
            );


            if(window.addEvent){

                addEvent(
                    "⛏️",
                    "Добыча",
                    `${resource.name} +${amount}`
                );

            }


            update();

            save();


            return amount;

        },


        /* -------------------------------------------------
           GET RESOURCES NEAR PLAYER
        ------------------------------------------------- */

        nearbyResources(
            radius = 30
        ){

            const pos =
                this.getPosition();


            return MapState.resources.filter(
                node =>

                    distance(
                        pos,
                        node
                    ) <= radius

            );

        },


        /* -------------------------------------------------
           GENERATE RESOURCES
        ------------------------------------------------- */

        generateResources(
            count = 100
        ){

            MapState.resources.length = 0;


            for(
                let i = 0;
                i < count;
                i++
            ){

                const types =
                    Object.keys(
                        RESOURCE_TYPES
                    );


                const type =
                    types[
                        random(
                            0,
                            types.length - 1
                        )
                    ];


                MapState.resources.push({

                    id:
                        `resource_${i}`,

                    type:
                        type,

                    x:
                        random(
                            -450,
                            450
                        ),

                    y:
                        random(
                            -450,
                            450
                        ),

                    amount:
                        random(
                            1,
                            3
                        )

                });

            }


            render();

        }

    };


    /* =====================================================
       ZONE EFFECTS
    ===================================================== */

    function checkZoneEffects(){

        const p =
            player();


        if(!p)
            return;


        const zone =
            MapSystem.getZone();


        /*
           Радиация.
        */

        if(
            zone.radiation > 0
        ){

            p.radiation =
                Math.min(
                    100,
                    Number(
                        p.radiation || 0
                    ) +
                    zone.radiation / 10
                );


            toast(
                `☢️ Радиация +${Math.round(
                    zone.radiation / 10
                )}`
            );

        }


        /*
           Опасная зона.
        */

        if(
            zone.danger >= 6 &&
            Math.random() < 0.25
        ){

            if(
                window.Combat
            ){

                const types = [
                    "wolf",
                    "boar",
                    "scavenger"
                ];


                Combat.spawn(
                    types[
                        random(
                            0,
                            types.length - 1
                        )
                    ]
                );

            }

        }

    }


    /* =====================================================
       MAP UI
    ===================================================== */

    function render(){

        const map =
            document.querySelector(
                ".world-map"
            );


        if(!map)
            return;


        map.innerHTML = "";


        /*
           Зоны.
        */

        ZONES.forEach(
            zone => {

                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "map-zone";


                element.dataset.zone =
                    zone.id;


                element.innerHTML = `

                    <span>
                        ${zone.icon}
                    </span>

                    <small>
                        ${zone.name}
                    </small>

                `;


                element.addEventListener(
                    "click",
                    () => {

                        MapState.selectedZone =
                            zone.id;


                        toast(
                            `${zone.icon} ${zone.name} • Опасность ${zone.danger}/10`
                        );

                    }
                );


                map.appendChild(
                    element
                );

            }
        );


        /*
           Монументы.
        */

        MONUMENTS.forEach(
            monument => {

                const element =
                    document.createElement(
                        "button"
                    );


                element.type =
                    "button";


                element.className =
                    "map-monument";


                element.innerHTML =
                    monument.icon;


                element.title =
                    monument.name;


                element.style.left =
                    `${
                        (
                            monument.x + 500
                        ) / 10
                    }%`;


                element.style.top =
                    `${
                        (
                            monument.y + 500
                        ) / 10
                    }%`;


                element.addEventListener(
                    "click",
                    () => {

                        MapSystem.travel(
                            monument.x,
                            monument.y
                        );

                    }
                );


                map.appendChild(
                    element
                );

            }
        );


        /*
           Игрок.
        */

        const pos =
            MapSystem.getPosition();


        const playerMarker =
            document.createElement(
                "div"
            );


        playerMarker.className =
            "map-player";


        playerMarker.innerHTML =
            "●";


        playerMarker.style.left =
            `${
                (
                    pos.x + 500
                ) / 10
            }%`;


        playerMarker.style.top =
            `${
                (
                    pos.y + 500
                ) / 10
            }%`;


        map.appendChild(
            playerMarker
        );

    }


    /* =====================================================
       MAP BUTTONS
    ===================================================== */

    function setupButtons(){

        document
            .querySelectorAll(
                "[data-move]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const value =
                                button.dataset.move;


                            const directions = {

                                up:
                                    [0, 1],

                                down:
                                    [0, -1],

                                left:
                                    [-1, 0],

                                right:
                                    [1, 0]

                            };


                            const direction =
                                directions[value];


                            if(direction){

                                MapSystem.move(
                                    direction[0],
                                    direction[1]
                                );

                            }

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-gather]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            MapSystem.gather(
                                button.dataset.gather
                            );

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-monument]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            MapSystem.searchMonument(
                                button.dataset.monument
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       KEYBOARD MOVEMENT
    ===================================================== */

    function keyboard(){

        const keys = {};

        document.addEventListener(
            "keydown",
            event => {

                keys[
                    event.key.toLowerCase()
                ] = true;

            }
        );


        document.addEventListener(
            "keyup",
            event => {

                keys[
                    event.key.toLowerCase()
                ] = false;

            }
        );


        setInterval(
            () => {

                let x = 0;

                let y = 0;


                if(keys.w || keys.arrowup)
                    y += 1;

                if(keys.s || keys.arrowdown)
                    y -= 1;

                if(keys.a || keys.arrowleft)
                    x -= 1;

                if(keys.d || keys.arrowright)
                    x += 1;


                if(x || y){

                    MapSystem.move(
                        x,
                        y
                    );

                }

            },
            250
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init(){

        const p =
            player();


        if(p){

            if(!p.position){

                p.position = {

                    x:
                        WORLD.spawn.x,

                    y:
                        WORLD.spawn.y

                };

            }


            if(
                typeof p.speed !==
                "number"
            ){

                p.speed = 10;

            }


            if(
                typeof p.radiation !==
                "number"
            ){

                p.radiation = 0;

            }

        }


        if(
            MapState.resources.length === 0
        ){

            MapSystem.generateResources(
                100
            );

        }


        MapSystem.discover();

        render();

        setupButtons();

        keyboard();

    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                init,
                300
            );

        }
    );


    if(
        document.readyState !==
        "loading"
    ){

        setTimeout(
            init,
            300
        );

    }


})();
