/* =========================================================
   WASTELAND — SURVIVAL
   crafting.js
   Система крафта
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       HELPERS
    ===================================================== */

    const player = () =>
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

        if (window.Inventory?.all)
            window.Inventory.sort();

        render();

    };


    /* =====================================================
       RECIPES
    ===================================================== */

    const RECIPES = {

        bandage: {

            id: "bandage",

            name: "Бинт",

            icon: "🩹",

            category: "medical",

            description:
                "Простой перевязочный материал.",

            result: 1,

            station: 0,

            cost: {

                cloth: 5

            }

        },


        water: {

            id: "water",

            name: "Бутылка воды",

            icon: "💧",

            category: "survival",

            description:
                "Чистая вода для восстановления жажды.",

            result: 1,

            station: 0,

            cost: {

                scrap: 5

            }

        },


        stone_axe: {

            id: "stone_axe",

            name: "Каменный топор",

            icon: "🪓",

            category: "tools",

            description:
                "Позволяет эффективнее добывать дерево.",

            result: 1,

            station: 0,

            cost: {

                wood: 80,
                stone: 30
            }

        },


        stone_pickaxe: {

            id: "stone_pickaxe",

            name: "Каменная кирка",

            icon: "⛏️",

            category: "tools",

            description:
                "Инструмент для добычи камня и руды.",

            result: 1,

            station: 0,

            cost: {

                wood: 60,
                stone: 50
            }

        },


        knife: {

            id: "knife",

            name: "Каменный нож",

            icon: "🔪",

            category: "weapons",

            description:
                "Примитивное оружие ближнего боя.",

            result: 1,

            station: 0,

            cost: {

                wood: 20,
                stone: 35
            }

        },


        bow: {

            id: "bow",

            name: "Лук",

            icon: "🏹",

            category: "weapons",

            description:
                "Дальнобойное оружие для охоты.",

            result: 1,

            station: 1,

            cost: {

                wood: 100,
                cloth: 20
            }

        },


        cooked_meat: {

            id: "cooked_meat",

            name: "Жареное мясо",

            icon: "🥩",

            category: "food",

            description:
                "Сырое мясо, приготовленное на огне.",

            result: 2,

            station: 1,

            cost: {

                raw_meat: 1

            }

        },


        furnace: {

            id: "furnace",

            name: "Печь",

            icon: "🔥",

            category: "building",

            description:
                "Позволяет переплавлять металл.",

            result: 1,

            station: 0,

            cost: {

                stone: 150,
                wood: 30
            }

        },


        chest: {

            id: "chest",

            name: "Большой ящик",

            icon: "📦",

            category: "building",

            description:
                "Хранилище для предметов.",

            result: 1,

            station: 0,

            cost: {

                wood: 120,
                metal: 10
            }

        },


        sleeping_bag: {

            id: "sleeping_bag",

            name: "Спальный мешок",

            icon: "🛏️",

            category: "survival",

            description:
                "Точка возрождения игрока.",

            result: 1,

            station: 0,

            cost: {

                cloth: 30,
                leather: 10
            }

        },


        campfire: {

            id: "campfire",

            name: "Костёр",

            icon: "🔥",

            category: "survival",

            description:
                "Источник тепла и приготовления еды.",

            result: 1,

            station: 0,

            cost: {

                wood: 50,
                stone: 25
            }

        }

    };


    window.CraftingRecipes =
        RECIPES;


    /* =====================================================
       CRAFTING SYSTEM
    ===================================================== */

    window.Crafting = {


        /* -------------------------------------------------
           GET RECIPE
        ------------------------------------------------- */

        get(recipeId){

            return RECIPES[recipeId] || null;

        },


        /* -------------------------------------------------
           CURRENT STATION
        ------------------------------------------------- */

        getStationLevel(){

            return Number(
                player()?.benchLevel ||
                0
            );

        },


        /* -------------------------------------------------
           CAN CRAFT
        ------------------------------------------------- */

        canCraft(recipeId){

            const p = player();

            const recipe =
                RECIPES[recipeId];


            if(!p || !recipe)
                return false;


            /*
               Проверяем уровень верстака.
            */

            const station =
                Number(
                    p.benchLevel || 0
                );


            if(station < recipe.station){

                return false;

            }


            /*
               Проверяем все ресурсы.
            */

            for(
                const [resource, amount]
                of Object.entries(recipe.cost)
            ){

                /*
                   Scrap хранится отдельно.
                */

                if(resource === "scrap"){

                    if(
                        Number(p.scrap || 0) <
                        amount
                    ){

                        return false;

                    }

                    continue;

                }


                /*
                   Обычные ресурсы игрока.
                */

                if(
                    resource in p &&
                    Number(p[resource] || 0) <
                    amount
                ){

                    return false;

                }


                /*
                   Предметы инвентаря.
                */

                if(
                    window.Inventory &&
                    window.Inventory.count
                ){

                    if(
                        window.Inventory.count(
                            resource
                        ) < amount
                    ){

                        return false;

                    }

                }

                else {

                    return false;

                }

            }


            return true;

        },


        /* -------------------------------------------------
           CRAFT
        ------------------------------------------------- */

        craft(recipeId){

            const p = player();

            const recipe =
                RECIPES[recipeId];


            if(!p || !recipe){

                toast(
                    "❌ Рецепт не найден"
                );

                return false;

            }


            /*
               Проверка верстака.
            */

            const station =
                Number(
                    p.benchLevel || 0
                );


            if(station < recipe.station){

                toast(
                    `🔨 Нужен верстак уровня ${recipe.station}`
                );

                return false;

            }


            /*
               Проверка ресурсов.
            */

            if(
                !this.canCraft(recipeId)
            ){

                toast(
                    "⚠️ Недостаточно ресурсов"
                );

                return false;

            }


            /*
               Списываем ресурсы.
            */

            for(
                const [resource, amount]
                of Object.entries(recipe.cost)
            ){

                /*
                   Scrap.
                */

                if(resource === "scrap"){

                    p.scrap =
                        Math.max(
                            0,
                            p.scrap - amount
                        );

                    continue;

                }


                /*
                   Ресурс игрока.
                */

                if(
                    resource in p
                ){

                    p[resource] =
                        Math.max(
                            0,
                            Number(p[resource]) -
                            amount
                        );

                    continue;

                }


                /*
                   Предмет из инвентаря.
                */

                if(
                    window.Inventory &&
                    window.Inventory.remove
                ){

                    window.Inventory.remove(
                        resource,
                        amount
                    );

                }

            }


            /*
               Добавляем результат.
            */

            if(
                window.Inventory &&
                window.Inventory.add
            ){

                window.Inventory.add(
                    recipe.id,
                    recipe.result
                );

            }


            /*
               Статистика.
            */

            p.crafted =
                Number(p.crafted || 0) +
                recipe.result;


            /*
               Уведомление.
            */

            toast(
                `${recipe.icon} ${recipe.name} создано ×${recipe.result}`
            );


            if(window.addEvent){

                addEvent(
                    "🔨",
                    "Крафт",
                    `${recipe.name} ×${recipe.result}`
                );

            }


            update();

            save();

            return true;

        },


        /* -------------------------------------------------
           BATCH CRAFT
        ------------------------------------------------- */

        craftMultiple(
            recipeId,
            amount = 1
        ){

            amount =
                Math.max(
                    1,
                    Math.floor(
                        Number(amount) || 1
                    )
                );


            let crafted = 0;


            for(
                let i = 0;
                i < amount;
                i++
            ){

                if(
                    !this.craft(recipeId)
                ){

                    break;

                }


                crafted++;

            }


            return crafted;

        },


        /* -------------------------------------------------
           COST TEXT
        ------------------------------------------------- */

        getCostText(recipeId){

            const recipe =
                RECIPES[recipeId];


            if(!recipe)
                return "";


            return Object.entries(
                recipe.cost
            )
            .map(
                ([resource, amount]) => {

                    const icons = {

                        wood: "🪵",

                        stone: "🪨",

                        metal: "⛓️",

                        cloth: "🧵",

                        leather: "🟫",

                        scrap: "⚙️",

                        raw_meat: "🍖",

                        components: "🔩"

                    };


                    return `${icons[resource] || "•"} ${amount}`;

                }
            )
            .join("  ");

        },


        /* -------------------------------------------------
           GET CATEGORY
        ------------------------------------------------- */

        getCategory(category){

            return Object.values(
                RECIPES
            ).filter(
                recipe =>
                    recipe.category === category
            );

        },


        /* -------------------------------------------------
           ALL RECIPES
        ------------------------------------------------- */

        all(){

            return Object.values(
                RECIPES
            );

        }

    };


    /* =====================================================
       UI
    ===================================================== */

    function render(){

        /*
           Если в index.html есть контейнер
           .recipes — строим его автоматически.
        */

        const container =
            document.querySelector(
                ".recipes"
            );


        if(!container)
            return;


        container.innerHTML = "";


        Object.values(
            RECIPES
        ).forEach(
            recipe => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "recipe";


                const available =
                    Crafting.canCraft(
                        recipe.id
                    );


                const station =
                    Number(
                        player()?.benchLevel ||
                        0
                    );


                const locked =
                    station <
                    recipe.station;


                card.innerHTML = `

                    <div class="recipe-icon">
                        ${recipe.icon}
                    </div>

                    <div class="recipe-info">

                        <b>
                            ${recipe.name}
                        </b>

                        <small>
                            ${recipe.description}
                        </small>

                        <small>
                            ${Crafting.getCostText(recipe.id)}
                        </small>

                    </div>

                    <button
                        type="button"
                        class="craft-button"
                        data-craft="${recipe.id}"
                        ${!available ? "disabled" : ""}
                    >
                        ${
                            locked
                                ? `🔒 ${recipe.station}`
                                : "СОЗДАТЬ"
                        }
                    </button>

                `;


                const button =
                    card.querySelector(
                        "[data-craft]"
                    );


                if(button){

                    button.addEventListener(
                        "click",
                        () => {

                            Crafting.craft(
                                recipe.id
                            );

                        }
                    );

                }


                container.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       CATEGORY BUTTONS
    ===================================================== */

    function setupCategories(){

        document
            .querySelectorAll(
                ".craft-category"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".craft-category"
                            )
                            .forEach(
                                b =>
                                    b.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        const category =
                            button.dataset.category;


                        filterRecipes(
                            category
                        );

                    }
                );

            });

    }


    function filterRecipes(
        category
    ){

        document
            .querySelectorAll(
                ".recipe"
            )
            .forEach(recipe => {

                if(
                    !category ||
                    category === "all"
                ){

                    recipe.style.display =
                        "";

                    return;

                }


                const id =
                    recipe
                        .querySelector(
                            "[data-craft]"
                        )
                        ?.dataset.craft;


                const data =
                    RECIPES[id];


                recipe.style.display =
                    data?.category ===
                    category
                        ? ""
                        : "none";

            });

    }


    /* =====================================================
       WORKBENCH
    ===================================================== */

    window.upgradeWorkbench =
        function(){

            const p = player();

            if(!p)
                return false;


            const current =
                Number(
                    p.benchLevel || 0
                );


            if(current >= 3){

                toast(
                    "🔨 Верстак уже максимального уровня"
                );

                return false;

            }


            const costs = {

                1: {
                    scrap: 100,
                    metal: 20
                },

                2: {
                    scrap: 250,
                    metal: 50
                },

                3: {
                    scrap: 500,
                    metal: 100
                }

            };


            const cost =
                costs[current + 1];


            if(!cost)
                return false;


            /*
               Проверяем.
            */

            for(
                const [resource, amount]
                of Object.entries(cost)
            ){

                if(
                    Number(p[resource] || 0) <
                    amount
                ){

                    toast(
                        "⚠️ Недостаточно ресурсов для улучшения"
                    );

                    return false;

                }

            }


            /*
               Списываем.
            */

            for(
                const [resource, amount]
                of Object.entries(cost)
            ){

                p[resource] -= amount;

            }


            p.benchLevel =
                current + 1;


            toast(
                `🔨 Верстак улучшен до уровня ${p.benchLevel}`
            );


            if(window.addEvent){

                addEvent(
                    "🔨",
                    "Верстак",
                    `Получен уровень ${p.benchLevel}`
                );

            }


            update();

            save();

            return true;

        };


    /* =====================================================
       STARTER WORKBENCH
    ===================================================== */

    function initPlayer(){

        const p = player();

        if(!p)
            return;


        /*
           Первый уровень верстака
           доступен сразу.
        */

        if(
            typeof p.benchLevel !==
            "number"
        ){

            p.benchLevel = 0;

        }


        if(
            typeof p.crafted !==
            "number"
        ){

            p.crafted = 0;

        }

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init(){

        initPlayer();

        render();

        setupCategories();

    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                init,
                150
            );

        }
    );


    if(
        document.readyState !==
        "loading"
    ){

        setTimeout(
            init,
            150
        );

    }


})();
