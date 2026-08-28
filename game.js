/* =========================================================
   WASTELAND — SURVIVAL
   game.js
   Центральный контроллер тестовой версии
   Без аккаунтов / Supabase / сервера
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       GAME STATE
    ===================================================== */

    window.Game = {

        version: "0.1.0",

        player: {

            hp: 100,
            maxHp: 100,

            hunger: 100,
            thirst: 100,
            energy: 100,

            radiation: 0,

            scrap: 500,

            wood: 500,
            stone: 300,
            metal: 100,
            cloth: 50,
            leather: 20,

            position: {
                x: 0,
                y: 0
            },

            inventory: [],

            kills: 0,
            builds: 0,
            loot: 0,

            survivalTime: 0
        },

        enemy: {

            name: "Дикий волк",
            hp: 60,
            maxHp: 60,
            damage: 8,
            alive: true
        },

        base: {

            level: 1,

            foundation: 1,
            walls: 0,
            doors: 0,
            chests: 0,
            furnaces: 0,

            health: 500,
            maxHealth: 500
        },

        loot: {

            available: true,

            items: [
                {
                    icon: "🧵",
                    name: "Ткань",
                    amount: 12
                },
                {
                    icon: "🔩",
                    name: "Компоненты",
                    amount: 4
                },
                {
                    icon: "⚙️",
                    name: "Scrap",
                    amount: 25
                }
            ]

        }

    };


    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = id => document.getElementById(id);


    function random(min, max){

        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;

    }


    function clamp(value, min, max){

        return Math.max(
            min,
            Math.min(max, value)
        );

    }


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer = null;


    window.showToast = function(message){

        const toast = $("toast");

        if(!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {

            toast.classList.remove("show");

        }, 1800);

    };


    /* =====================================================
       UI UPDATE
    ===================================================== */

    function updateUI(){

        const p = Game.player;


        /* TOP */

        if($("hp"))
            $("hp").textContent = Math.round(p.hp);

        if($("hunger"))
            $("hunger").textContent = Math.round(p.hunger);

        if($("thirst"))
            $("thirst").textContent = Math.round(p.thirst);

        if($("energy"))
            $("energy").textContent = Math.round(p.energy);

        if($("radiation"))
            $("radiation").textContent = Math.round(p.radiation);

        if($("scrap"))
            $("scrap").textContent = p.scrap;


        /* STATUS TEXT */

        if($("hpText"))
            $("hpText").textContent =
                `${Math.round(p.hp)} / ${p.maxHp}`;

        if($("hungerText"))
            $("hungerText").textContent =
                `${Math.round(p.hunger)} / 100`;

        if($("thirstText"))
            $("thirstText").textContent =
                `${Math.round(p.thirst)} / 100`;


        /* BARS */

        if($("hpBar"))
            $("hpBar").style.width =
                `${clamp(p.hp,0,100)}%`;

        if($("hungerBar"))
            $("hungerBar").style.width =
                `${clamp(p.hunger,0,100)}%`;

        if($("thirstBar"))
            $("thirstBar").style.width =
                `${clamp(p.thirst,0,100)}%`;


        /* COORDINATES */

        if($("coordinates")){

            $("coordinates").textContent =
                `X: ${Math.round(p.position.x)} / Y: ${Math.round(p.position.y)}`;

        }


        /* STATS */

        if($("statWood"))
            $("statWood").textContent =
                p.wood;

        if($("statStone"))
            $("statStone").textContent =
                p.stone;

        if($("statKills"))
            $("statKills").textContent =
                p.kills;

        if($("statBuilds"))
            $("statBuilds").textContent =
                p.builds;

        if($("statLoot"))
            $("statLoot").textContent =
                p.loot;

        if($("statTime"))
            $("statTime").textContent =
                formatTime(p.survivalTime);


        /* BASE */

        if($("baseLevel"))
            $("baseLevel").textContent =
                `Уровень ${Game.base.level}`;


        /* BENCH */

        if($("benchLevel"))
            $("benchLevel").textContent = "I";


        /* WEIGHT */

        updateWeight();

    }


    /* =====================================================
       WEIGHT
    ===================================================== */

    function updateWeight(){

        let weight = 0;

        const p = Game.player;

        weight += p.wood * 0.01;
        weight += p.stone * 0.015;
        weight += p.metal * 0.02;
        weight += p.cloth * 0.005;
        weight += p.leather * 0.01;

        if($("weight")){

            $("weight").textContent =
                `${weight.toFixed(1)} / 50 кг`;

        }

    }


    /* =====================================================
       SCREEN NAVIGATION
    ===================================================== */

    function openScreen(name){

        document
            .querySelectorAll(".screen")
            .forEach(screen => {

                screen.classList.remove("active");

            });


        const target =
            $(`screen-${name}`);

        if(target)
            target.classList.add("active");


        document
            .querySelectorAll(".nav")
            .forEach(button => {

                if(button.dataset.screen === name)
                    button.classList.add("active");

                else
                    button.classList.remove("active");

            });


        document
            .querySelectorAll(".mobile-nav-button")
            .forEach(button => {

                if(button.dataset.screen === name)
                    button.classList.add("active");

                else
                    button.classList.remove("active");

            });

    }


    function setupNavigation(){

        document
            .querySelectorAll("[data-screen]")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const screen =
                        button.dataset.screen;

                    if(screen)
                        openScreen(screen);

                });

            });

    }


    /* =====================================================
       RESOURCE COLLECTION
    ===================================================== */

    function gatherWood(){

        const amount = random(10,25);

        Game.player.wood += amount;

        Game.player.position.x += random(-2,2);
        Game.player.position.y += random(-2,2);

        showToast(`🪵 Получено дерева: +${amount}`);

        updateUI();

        saveGame();

    }


    function gatherStone(){

        const amount = random(8,20);

        Game.player.stone += amount;

        Game.player.position.x += random(-2,2);

        showToast(`🪨 Получено камня: +${amount}`);

        updateUI();

        saveGame();

    }


    function gatherMetal(){

        const amount = random(3,12);

        Game.player.metal += amount;

        Game.player.scrap += random(1,4);

        Game.player.position.x += random(1,4);

        showToast(
            `⛓️ Металл +${amount} • Scrap найден`
        );

        updateUI();

        saveGame();

    }


    function hunt(){

        const meat = random(2,7);
        const leather = random(1,4);

        Game.player.inventory.push({

            id: "raw_meat",
            icon: "🍖",
            name: "Сырое мясо",
            amount: meat

        });


        Game.player.leather += leather;

        Game.player.energy =
            clamp(
                Game.player.energy - 5,
                0,
                100
            );


        showToast(
            `🐗 Добыча: мясо ×${meat}, кожа ×${leather}`
        );


        updateUI();

        saveGame();

    }


    /* =====================================================
       BUTTONS
    ===================================================== */

    function setupGathering(){

        $("gatherWood")?.addEventListener(
            "click",
            gatherWood
        );

        $("gatherStone")?.addEventListener(
            "click",
            gatherStone
        );

        $("gatherMetal")?.addEventListener(
            "click",
            gatherMetal
        );

        $("hunt")?.addEventListener(
            "click",
            hunt
        );

    }


    /* =====================================================
       SCRAP SYSTEM
    ===================================================== */

    window.addScrap = function(amount){

        amount = Number(amount) || 0;

        Game.player.scrap += amount;

        Game.player.scrap =
            Math.max(0, Game.player.scrap);

        updateUI();

        saveGame();

    };


    window.removeScrap = function(amount){

        amount = Number(amount) || 0;

        if(Game.player.scrap < amount){

            showToast("⚠️ Недостаточно Scrap");

            return false;

        }

        Game.player.scrap -= amount;

        updateUI();

        saveGame();

        return true;

    };


    window.spendScrap = window.removeScrap;


    /* =====================================================
       RESOURCE SYSTEM
    ===================================================== */

    window.addResource = function(type, amount){

        if(!Game.player.hasOwnProperty(type))
            return false;

        Game.player[type] += Number(amount) || 0;

        updateUI();

        saveGame();

        return true;

    };


    window.removeResource = function(type, amount){

        if(!Game.player.hasOwnProperty(type))
            return false;

        amount = Number(amount) || 0;

        if(Game.player[type] < amount){

            showToast("⚠️ Недостаточно ресурсов");

            return false;

        }

        Game.player[type] -= amount;

        updateUI();

        saveGame();

        return true;

    };


    /* =====================================================
       SURVIVAL
    ===================================================== */

    function survivalTick(){

        const p = Game.player;


        p.survivalTime++;


        /* Hunger */

        p.hunger -= 0.12;


        /* Thirst */

        p.thirst -= 0.18;


        /* Energy */

        if(p.hunger > 30 && p.thirst > 30)
            p.energy += 0.03;

        else
            p.energy -= 0.05;


        p.hunger =
            clamp(p.hunger,0,100);

        p.thirst =
            clamp(p.thirst,0,100);

        p.energy =
            clamp(p.energy,0,100);


        /* Starvation */

        if(p.hunger <= 0){

            p.hp -= 0.25;

        }


        /* Dehydration */

        if(p.thirst <= 0){

            p.hp -= 0.4;

        }


        p.hp =
            clamp(p.hp,0,p.maxHp);


        if(p.hp <= 0){

            death();

        }


        updateUI();

    }


    /* =====================================================
       DRINK / FOOD
    ===================================================== */

    window.eatFood = function(amount = 25){

        Game.player.hunger =
            clamp(
                Game.player.hunger + amount,
                0,
                100
            );

        showToast(`🍖 Голод восстановлен`);

        updateUI();

        saveGame();

    };


    window.drinkWater = function(amount = 30){

        Game.player.thirst =
            clamp(
                Game.player.thirst + amount,
                0,
                100
            );

        showToast(`💧 Жажда восстановлена`);

        updateUI();

        saveGame();

    };


    window.healPlayer = function(amount = 20){

        Game.player.hp =
            clamp(
                Game.player.hp + amount,
                0,
                Game.player.maxHp
            );

        showToast(`🩹 Здоровье +${amount}`);

        updateUI();

        saveGame();

    };


    /* =====================================================
       DEATH
    ===================================================== */

    function death(){

        const p = Game.player;


        showToast("💀 Ты погиб");


        p.hp = p.maxHp;
        p.hunger = 70;
        p.thirst = 70;
        p.energy = 80;

        /*
           Тестовая потеря Scrap.
        */

        const lost =
            Math.floor(p.scrap * 0.15);

        p.scrap =
            Math.max(
                0,
                p.scrap - lost
            );


        p.position.x = 0;
        p.position.y = 0;


        addEvent(
            "💀",
            "Смерть",
            `Ты потерял ${lost} Scrap и вернулся на берег.`
        );


        updateUI();

        saveGame();

    }


    /* =====================================================
       TIME
    ===================================================== */

    function formatTime(seconds){

        seconds = Math.max(
            0,
            Math.floor(seconds)
        );


        const hours =
            Math.floor(seconds / 3600);

        const minutes =
            Math.floor(
                (seconds % 3600) / 60
            );

        const secs =
            seconds % 60;


        return [

            String(hours).padStart(2,"0"),

            String(minutes).padStart(2,"0"),

            String(secs).padStart(2,"0")

        ].join(":");

    }


    /* =====================================================
       EVENTS LOG
    ===================================================== */

    window.addEvent = function(
        icon,
        title,
        text
    ){

        const list =
            $("eventsList");

        if(!list)
            return;


        const card =
            document.createElement("div");

        card.className =
            "event-card";


        card.innerHTML = `

            <span>${icon}</span>

            <div>

                <b>${title}</b>

                <p>${text}</p>

                <small>только что</small>

            </div>

        `;


        list.prepend(card);


        while(list.children.length > 12){

            list.removeChild(
                list.lastElementChild
            );

        }

    };


    /* =====================================================
       LOOT
    ===================================================== */

    function setupLoot(){

        $("takeLoot")?.addEventListener(
            "click",
            takeLoot
        );

    }


    function takeLoot(){

        const loot =
            Game.loot;


        if(!loot.available){

            showToast("📦 Этот контейнер пуст");

            return;

        }


        let message = "";


        loot.items.forEach(item => {

            if(item.name === "Scrap"){

                Game.player.scrap += item.amount;

            }

            else if(item.name === "Ткань"){

                Game.player.cloth += item.amount;

            }

            else {

                Game.player.inventory.push({

                    id: item.name.toLowerCase(),

                    icon: item.icon,

                    name: item.name,

                    amount: item.amount

                });

            }


            message +=
                `${item.icon} ${item.name} ×${item.amount} `;

        });


        Game.player.loot++;


        loot.available = false;


        showToast("📦 Лут забран");


        addEvent(
            "📦",
            "Контейнер",
            `Получено: ${message}`
        );


        const lootItems =
            $("lootItems");

        if(lootItems){

            lootItems.innerHTML =
                `<div>Контейнер пуст.</div>`;

        }


        updateUI();

        saveGame();

    }


    /* =====================================================
       SAVE
    ===================================================== */

    function saveGame(){

        try{

            localStorage.setItem(
                "wasteland_test_save",
                JSON.stringify({

                    player:Game.player,

                    enemy:Game.enemy,

                    base:Game.base,

                    loot:Game.loot,

                    version:Game.version

                })
            );

        }

        catch(error){

            console.warn(
                "Не удалось сохранить игру",
                error
            );

        }

    }


    window.saveGame = saveGame;


    function loadGame(){

        try{

            const raw =
                localStorage.getItem(
                    "wasteland_test_save"
                );


            if(!raw)
                return false;


            const data =
                JSON.parse(raw);


            if(data.player){

                Object.assign(
                    Game.player,
                    data.player
                );

            }


            if(data.enemy){

                Object.assign(
                    Game.enemy,
                    data.enemy
                );

            }


            if(data.base){

                Object.assign(
                    Game.base,
                    data.base
                );

            }


            if(data.loot){

                Object.assign(
                    Game.loot,
                    data.loot
                );

            }


            return true;

        }

        catch(error){

            console.warn(
                "Ошибка загрузки сохранения",
                error
            );

            return false;

        }

    }


    /* =====================================================
       RESET
    ===================================================== */

    window.resetGame = function(){

        localStorage.removeItem(
            "wasteland_test_save"
        );

        location.reload();

    };


    /* =====================================================
       RANDOM WORLD EVENTS
    ===================================================== */

    function randomEvent(){

        const events = [

            {
                icon:"✈️",
                title:"Воздушный груз",
                text:"Самолёт замечен над территорией."
            },

            {
                icon:"📡",
                title:"Неизвестный сигнал",
                text:"На северо-востоке обнаружен странный радиосигнал."
            },

            {
                icon:"☢️",
                title:"Радиация",
                text:"Уровень радиации в одном из районов вырос."
            },

            {
                icon:"🐺",
                title:"Хищники",
                text:"В лесу замечена стая волков."
            },

            {
                icon:"💨",
                title:"Погода",
                text:"На территории начинается сильный ветер."
            }

        ];


        const event =
            events[
                random(0,events.length - 1)
            ];


        addEvent(
            event.icon,
            event.title,
            event.text
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function init(){

        const loaded =
            loadGame();


        setupNavigation();

        setupGathering();

        setupLoot();


        updateUI();


        if(!loaded){

            addEvent(
                "📡",
                "Система",
                "Тестовый мир создан. У тебя есть стартовые ресурсы."
            );

            saveGame();

        }


        /*
           Выживание:
           один игровой тик = 1 секунда.
        */

        setInterval(
            survivalTick,
            1000
        );


        /*
           Случайное событие
           примерно каждые 45–90 секунд.
        */

        setInterval(
            randomEvent,
            random(45000,90000)
        );


        /*
           Автосохранение
        */

        setInterval(
            saveGame,
            10000
        );


        console.log(
            "WASTELAND Survival",
            Game.version,
            "запущен."
        );

    }


    /* =====================================================
       START
    ===================================================== */

    if(document.readyState === "loading"){

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    }

    else{

        init();

    }


})();
