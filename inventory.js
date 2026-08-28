/* =========================================================
   WASTELAND — SURVIVAL
   inventory.js
   Инвентарь игрока
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       HELPERS
    ===================================================== */

    const getPlayer = () =>
        window.Game?.player || null;


    const toast = message => {

        if (typeof window.showToast === "function")
            window.showToast(message);

    };


    const save = () => {

        if (typeof window.saveGame === "function")
            window.saveGame();

    };


    const update = () => {

        if (typeof window.updateUI === "function")
            window.updateUI();

        render();

    };


    /* =====================================================
       ITEM DATABASE
    ===================================================== */

    const ITEMS = {

        wood: {
            id: "wood",
            name: "Дерево",
            icon: "🪵",
            type: "resource",
            weight: 0.01
        },

        stone: {
            id: "stone",
            name: "Камень",
            icon: "🪨",
            type: "resource",
            weight: 0.015
        },

        metal: {
            id: "metal",
            name: "Металл",
            icon: "⛓️",
            type: "resource",
            weight: 0.02
        },

        cloth: {
            id: "cloth",
            name: "Ткань",
            icon: "🧵",
            type: "resource",
            weight: 0.005
        },

        leather: {
            id: "leather",
            name: "Кожа",
            icon: "🟫",
            type: "resource",
            weight: 0.01
        },

        raw_meat: {
            id: "raw_meat",
            name: "Сырое мясо",
            icon: "🍖",
            type: "food",
            weight: 0.2,
            hunger: 18
        },

        cooked_meat: {
            id: "cooked_meat",
            name: "Жареное мясо",
            icon: "🥩",
            type: "food",
            weight: 0.2,
            hunger: 35
        },

        water: {
            id: "water",
            name: "Вода",
            icon: "💧",
            type: "drink",
            weight: 0.5,
            thirst: 45
        },

        bandage: {
            id: "bandage",
            name: "Бинт",
            icon: "🩹",
            type: "medical",
            weight: 0.1,
            heal: 20
        },

        components: {
            id: "components",
            name: "Компоненты",
            icon: "🔩",
            type: "component",
            weight: 0.15
        },

        scrap: {
            id: "scrap",
            name: "Scrap",
            icon: "⚙️",
            type: "currency",
            weight: 0
        },

        stone_axe: {
            id: "stone_axe",
            name: "Каменный топор",
            icon: "🪓",
            type: "tool",
            weight: 1.5,
            damage: 12,
            durability: 100
        },

        stone_pickaxe: {
            id: "stone_pickaxe",
            name: "Каменная кирка",
            icon: "⛏️",
            type: "tool",
            weight: 1.8,
            damage: 14,
            durability: 100
        },

        bow: {
            id: "bow",
            name: "Лук",
            icon: "🏹",
            type: "weapon",
            weight: 1.2,
            damage: 20,
            durability: 100
        },

        knife: {
            id: "knife",
            name: "Нож",
            icon: "🔪",
            type: "weapon",
            weight: 0.8,
            damage: 16,
            durability: 100
        }

    };


    window.ItemDatabase = ITEMS;


    /* =====================================================
       INVENTORY API
    ===================================================== */

    window.Inventory = {

        /* -------------------------------------------------
           FIND
        ------------------------------------------------- */

        find(itemId) {

            const p = getPlayer();

            if (!p)
                return null;

            return p.inventory.find(
                item => item.id === itemId
            ) || null;

        },


        /* -------------------------------------------------
           COUNT
        ------------------------------------------------- */

        count(itemId) {

            const item =
                this.find(itemId);

            return item
                ? Number(item.amount) || 0
                : 0;

        },


        /* -------------------------------------------------
           HAS
        ------------------------------------------------- */

        has(itemId, amount = 1) {

            return this.count(itemId) >= amount;

        },


        /* -------------------------------------------------
           ADD
        ------------------------------------------------- */

        add(itemId, amount = 1) {

            const p = getPlayer();

            if (!p)
                return false;

            amount =
                Math.floor(
                    Number(amount) || 0
                );

            if (amount <= 0)
                return false;


            const data =
                ITEMS[itemId];


            if (!data) {

                console.warn(
                    "Неизвестный предмет:",
                    itemId
                );

                return false;

            }


            const existing =
                this.find(itemId);


            if (existing){

                existing.amount += amount;

            }

            else {

                p.inventory.push({

                    id: itemId,

                    icon: data.icon,

                    name: data.name,

                    amount: amount

                });

            }


            update();

            save();

            return true;

        },


        /* -------------------------------------------------
           REMOVE
        ------------------------------------------------- */

        remove(itemId, amount = 1) {

            const p = getPlayer();

            if (!p)
                return false;


            amount =
                Math.floor(
                    Number(amount) || 0
                );


            if (
                amount <= 0 ||
                !this.has(itemId, amount)
            ){

                toast(
                    `⚠️ Недостаточно: ${
                        ITEMS[itemId]?.name ||
                        itemId
                    }`
                );

                return false;

            }


            const item =
                this.find(itemId);


            item.amount -= amount;


            if(item.amount <= 0){

                p.inventory =
                    p.inventory.filter(
                        i => i !== item
                    );

            }


            update();

            save();

            return true;

        },


        /* -------------------------------------------------
           TAKE
        ------------------------------------------------- */

        take(itemId, amount = 1) {

            if (
                !this.has(
                    itemId,
                    amount
                )
            ){

                toast(
                    `❌ Нет предмета: ${
                        ITEMS[itemId]?.name ||
                        itemId
                    }`
                );

                return false;

            }


            return this.remove(
                itemId,
                amount
            );

        },


        /* -------------------------------------------------
           GIVE
        ------------------------------------------------- */

        give(itemId, amount = 1) {

            const result =
                this.add(
                    itemId,
                    amount
                );


            if(result){

                const data =
                    ITEMS[itemId];

                toast(
                    `${data.icon} ${data.name} +${amount}`
                );

            }


            return result;

        },


        /* =================================================
           USE ITEM
        ================================================= */

        use(itemId) {

            const item =
                this.find(itemId);


            if(!item){

                toast(
                    "❌ Предмет отсутствует"
                );

                return false;

            }


            const data =
                ITEMS[itemId];


            if(!data){

                toast(
                    "❌ Предмет не найден"
                );

                return false;

            }


            /* FOOD */

            if(data.type === "food"){

                if(
                    window.Player &&
                    Player.eat
                ){

                    Player.eat(
                        data.hunger,
                        data.name
                    );

                }

                else {

                    getPlayer().hunger =
                        Math.min(
                            100,
                            getPlayer().hunger +
                            data.hunger
                        );

                }


                this.remove(
                    itemId,
                    1
                );

                return true;

            }


            /* DRINK */

            if(data.type === "drink"){

                if(
                    window.Player &&
                    Player.drink
                ){

                    Player.drink(
                        data.thirst
                    );

                }

                else {

                    getPlayer().thirst =
                        Math.min(
                            100,
                            getPlayer().thirst +
                            data.thirst
                        );

                }


                this.remove(
                    itemId,
                    1
                );

                return true;

            }


            /* MEDICAL */

            if(data.type === "medical"){

                if(
                    window.Player &&
                    Player.heal
                ){

                    Player.heal(
                        data.heal
                    );

                }


                this.remove(
                    itemId,
                    1
                );

                return true;

            }


            toast(
                `ℹ️ ${data.name} нельзя использовать сейчас`
            );

            return false;

        },


        /* =================================================
           TOTAL WEIGHT
        ================================================= */

        getWeight() {

            const p = getPlayer();

            if (!p)
                return 0;


            let weight = 0;


            p.inventory.forEach(item => {

                const data =
                    ITEMS[item.id];


                if(!data)
                    return;


                weight +=
                    (data.weight || 0) *
                    (Number(item.amount) || 0);

            });


            /*
               Ресурсы, которые game.js хранит
               отдельно от inventory.
            */

            weight +=
                (p.wood || 0) *
                (ITEMS.wood.weight || 0);

            weight +=
                (p.stone || 0) *
                (ITEMS.stone.weight || 0);

            weight +=
                (p.metal || 0) *
                (ITEMS.metal.weight || 0);

            weight +=
                (p.cloth || 0) *
                (ITEMS.cloth.weight || 0);

            weight +=
                (p.leather || 0) *
                (ITEMS.leather.weight || 0);


            return Number(
                weight.toFixed(2)
            );

        },


        /* =================================================
           CAPACITY
        ================================================= */

        capacity: 50,


        getRemainingWeight() {

            return Math.max(
                0,
                this.capacity -
                this.getWeight()
            );

        },


        canCarry(
            itemId,
            amount = 1
        ){

            const data =
                ITEMS[itemId];


            if(!data)
                return false;


            const weight =
                (data.weight || 0) *
                amount;


            return (
                this.getWeight() +
                weight <=
                this.capacity
            );

        },


        /* =================================================
           CLEAR
        ================================================= */

        clear() {

            const p = getPlayer();

            if(!p)
                return;


            p.inventory = [];


            update();

            save();

        },


        /* =================================================
           SORT
        ================================================= */

        sort() {

            const p = getPlayer();

            if(!p)
                return;


            p.inventory.sort(
                (a,b) =>
                    String(a.name)
                        .localeCompare(
                            String(b.name),
                            "ru"
                        )
            );


            update();

            save();

        },


        /* =================================================
           GET ALL
        ================================================= */

        all() {

            const p = getPlayer();

            if(!p)
                return [];


            return [
                ...p.inventory
            ];

        }

    };


    /* =====================================================
       RENDER INVENTORY
    ===================================================== */

    function render(){

        const container =
            document.querySelector(
                ".inventory-grid"
            );


        if(!container)
            return;


        const p =
            getPlayer();


        if(!p)
            return;


        container.innerHTML = "";


        /*
           Отдельные ресурсы игрока.
        */

        const resources = [

            {
                id:"wood",
                amount:p.wood
            },

            {
                id:"stone",
                amount:p.stone
            },

            {
                id:"metal",
                amount:p.metal
            },

            {
                id:"cloth",
                amount:p.cloth
            },

            {
                id:"leather",
                amount:p.leather
            }

        ];


        resources.forEach(resource => {

            if(resource.amount <= 0)
                return;


            createSlot(
                container,
                resource.id,
                resource.amount
            );

        });


        /*
           Обычный инвентарь.
        */

        p.inventory.forEach(item => {

            createSlot(
                container,
                item.id,
                item.amount
            );

        });


        /*
           Пустые слоты.
        */

        const slots =
            30;


        const used =
            resources.filter(
                r => r.amount > 0
            ).length +
            p.inventory.length;


        for(
            let i = used;
            i < slots;
            i++
        ){

            const empty =
                document.createElement("div");

            empty.className =
                "inventory-item empty";

            empty.innerHTML =
                `<span>·</span>`;

            container.appendChild(
                empty
            );

        }

    }


    /* =====================================================
       CREATE SLOT
    ===================================================== */

    function createSlot(
        container,
        itemId,
        amount
    ){

        const data =
            ITEMS[itemId];


        if(!data)
            return;


        const slot =
            document.createElement("div");


        slot.className =
            "inventory-item";


        slot.dataset.item =
            itemId;


        slot.innerHTML = `

            <span>${data.icon}</span>

            <span class="amount">
                ${amount}
            </span>

        `;


        slot.title =
            `${data.name} ×${amount}`;


        slot.addEventListener(
            "click",
            () => {

                /*
                   Ресурсы просто показывают
                   информацию.
                */

                if(
                    data.type === "resource" ||
                    data.type === "component"
                ){

                    toast(
                        `${data.icon} ${data.name}: ${amount}`
                    );

                    return;

                }


                /*
                   Остальные предметы можно использовать.
                */

                Inventory.use(
                    itemId
                );

            }
        );


        container.appendChild(
            slot
        );

    }


    /* =====================================================
       TEST ITEMS
    ===================================================== */

    function giveTestItems(){

        const p = getPlayer();

        if(!p)
            return;


        /*
           Добавляем предметы только
           если инвентарь пустой.
        */

        if(p.inventory.length > 0)
            return;


        Inventory.add(
            "raw_meat",
            5
        );

        Inventory.add(
            "water",
            3
        );

        Inventory.add(
            "bandage",
            2
        );

        Inventory.add(
            "components",
            4
        );

    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init(){

        const p = getPlayer();

        if(!p)
            return;


        if(!Array.isArray(p.inventory))
            p.inventory = [];


        giveTestItems();

        render();

    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                init,
                100
            );

        }
    );


    /*
       Если Game уже загружен
       к моменту подключения файла.
    */

    if(
        document.readyState !==
        "loading"
    ){

        setTimeout(
            init,
            100
        );

    }


})();
