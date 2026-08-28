/* =========================================================
   WASTELAND — SURVIVAL
   player.js
   Система персонажа
   Без аккаунтов / Supabase
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       SHORTCUT
    ===================================================== */

    const player = () => window.Game?.player;


    const clamp = (value, min = 0, max = 100) =>
        Math.max(min, Math.min(max, value));


    /* =====================================================
       PLAYER STATE
    ===================================================== */

    window.Player = {

        /* -------------------------------------------------
           HEALTH
        ------------------------------------------------- */

        damage(amount, reason = "Получен урон") {

            const p = player();

            if (!p || p.hp <= 0) return;

            amount = Math.max(0, Number(amount) || 0);

            p.hp = clamp(
                p.hp - amount,
                0,
                p.maxHp
            );

            if (window.addEvent) {

                addEvent(
                    "💥",
                    "Урон",
                    `${reason}: -${Math.round(amount)} HP`
                );

            }

            this.update();

            this.save();

        },


        heal(amount = 20) {

            const p = player();

            if (!p) return;

            amount = Math.max(
                0,
                Number(amount) || 0
            );

            const oldHp = p.hp;

            p.hp = clamp(
                p.hp + amount,
                0,
                p.maxHp
            );

            const healed =
                Math.round(p.hp - oldHp);

            if (healed > 0 && window.showToast) {

                showToast(
                    `❤️ +${healed} здоровья`
                );

            }

            this.update();

            this.save();

        },


        /* -------------------------------------------------
           HUNGER
        ------------------------------------------------- */

        eat(amount = 25, foodName = "еда") {

            const p = player();

            if (!p) return false;

            amount = Math.max(
                0,
                Number(amount) || 0
            );

            const old =
                p.hunger;

            p.hunger = clamp(
                p.hunger + amount
            );

            const restored =
                Math.round(p.hunger - old);


            if (window.showToast) {

                showToast(
                    `🍖 ${foodName}: +${restored} сытости`
                );

            }


            this.update();

            this.save();

            return true;

        },


        /* -------------------------------------------------
           THIRST
        ------------------------------------------------- */

        drink(amount = 30) {

            const p = player();

            if (!p) return false;

            amount = Math.max(
                0,
                Number(amount) || 0
            );

            const old =
                p.thirst;

            p.thirst = clamp(
                p.thirst + amount
            );

            const restored =
                Math.round(p.thirst - old);


            if (window.showToast) {

                showToast(
                    `💧 +${restored} жажды`
                );

            }


            this.update();

            this.save();

            return true;

        },


        /* -------------------------------------------------
           ENERGY
        ------------------------------------------------- */

        useEnergy(amount = 5) {

            const p = player();

            if (!p) return false;

            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );

            if (p.energy < amount) {

                if (window.showToast) {

                    showToast(
                        "⚡ Недостаточно энергии"
                    );

                }

                return false;

            }


            p.energy = clamp(
                p.energy - amount
            );


            this.update();

            this.save();

            return true;

        },


        restoreEnergy(amount = 15) {

            const p = player();

            if (!p) return;

            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );

            p.energy = clamp(
                p.energy + amount
            );


            this.update();

            this.save();

        },


        /* =================================================
           RADIATION
        ================================================= */

        addRadiation(amount = 1) {

            const p = player();

            if (!p) return;

            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );

            p.radiation = clamp(
                p.radiation + amount
            );


            if (
                p.radiation >= 80 &&
                window.showToast
            ){

                showToast(
                    "☢️ Критический уровень радиации"
                );

            }

            else if (
                p.radiation >= 50 &&
                window.showToast
            ){

                showToast(
                    "☢️ Радиация повышена"
                );

            }


            this.update();

            this.save();

        },


        removeRadiation(amount = 5) {

            const p = player();

            if (!p) return;

            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );

            p.radiation =
                clamp(
                    p.radiation - amount
                );


            this.update();

            this.save();

        },


        /* =================================================
           MOVEMENT
        ================================================= */

        move(dx = 0, dy = 0) {

            const p = player();

            if (!p) return false;


            dx = Number(dx) || 0;
            dy = Number(dy) || 0;


            if (!this.useEnergy(.5))
                return false;


            p.position.x += dx;
            p.position.y += dy;


            this.update();

            this.save();

            return true;

        },


        /* =================================================
           REST
        ================================================= */

        rest(seconds = 10) {

            const p = player();

            if (!p) return;


            seconds =
                Math.max(
                    1,
                    Number(seconds) || 1
                );


            p.energy = clamp(
                p.energy + seconds * .8
            );

            p.hp = clamp(
                p.hp + seconds * .15,
                0,
                p.maxHp
            );


            /*
               Отдых немного увеличивает голод
               и жажду.
            */

            p.hunger = clamp(
                p.hunger - seconds * .04
            );

            p.thirst = clamp(
                p.thirst - seconds * .06
            );


            if (window.showToast) {

                showToast(
                    `🛏️ Отдых: +${Math.round(seconds * .8)} энергии`
                );

            }


            this.update();

            this.save();

        },


        /* =================================================
           STATUS EFFECTS
        ================================================= */

        getStatus() {

            const p = player();

            if (!p)
                return "unknown";


            if (p.hp <= 20)
                return "critical";


            if (p.thirst <= 15)
                return "dehydrated";


            if (p.hunger <= 15)
                return "starving";


            if (p.energy <= 15)
                return "exhausted";


            if (p.radiation >= 70)
                return "radiated";


            if (
                p.hp >= 80 &&
                p.hunger >= 70 &&
                p.thirst >= 70 &&
                p.energy >= 70
            ){

                return "healthy";

            }


            return "normal";

        },


        getStatusText() {

            const status =
                this.getStatus();


            const names = {

                healthy:
                    "Здоров",

                normal:
                    "Нормальное состояние",

                critical:
                    "Критическое состояние",

                dehydrated:
                    "Обезвоживание",

                starving:
                    "Голод",

                exhausted:
                    "Истощение",

                radiated:
                    "Радиационное заражение"

            };


            return (
                names[status] ||
                "Неизвестно"
            );

        },


        /* =================================================
           SURVIVAL EFFECTS
        ================================================= */

        tick() {

            const p = player();

            if (!p || p.hp <= 0)
                return;


            /*
               Естественное снижение показателей.
            */

            p.hunger =
                clamp(
                    p.hunger - 0.08
                );

            p.thirst =
                clamp(
                    p.thirst - 0.12
                );


            /*
               Энергия.
            */

            if (
                p.hunger > 50 &&
                p.thirst > 50
            ){

                p.energy =
                    clamp(
                        p.energy + 0.02
                    );

            }

            else {

                p.energy =
                    clamp(
                        p.energy - 0.04
                    );

            }


            /*
               Голод.
            */

            if (p.hunger <= 0){

                p.hp =
                    clamp(
                        p.hp - 0.15,
                        0,
                        p.maxHp
                    );

            }


            /*
               Обезвоживание сильнее влияет
               на здоровье.
            */

            if (p.thirst <= 0){

                p.hp =
                    clamp(
                        p.hp - 0.25,
                        0,
                        p.maxHp
                    );

            }


            /*
               Радиация.
            */

            if (p.radiation >= 70){

                p.hp =
                    clamp(
                        p.hp - 0.08,
                        0,
                        p.maxHp
                    );

            }


            /*
               Если игрок очень истощён,
               постепенно теряет здоровье.
            */

            if (p.energy <= 0){

                p.hp =
                    clamp(
                        p.hp - 0.05,
                        0,
                        p.maxHp
                    );

            }


            /*
               Смерть.
            */

            if (p.hp <= 0){

                this.die();

                return;

            }


            this.update();

        },


        /* =================================================
           DEATH
        ================================================= */

        die() {

            const p = player();

            if (!p) return;


            if (window.addEvent) {

                addEvent(
                    "💀",
                    "Ты погиб",
                    "Персонаж возвращается в безопасную точку."
                );

            }


            /*
               Тестовая механика смерти:
               часть Scrap теряется.
            */

            const lostScrap =
                Math.floor(
                    p.scrap * .15
                );


            p.scrap =
                Math.max(
                    0,
                    p.scrap - lostScrap
                );


            p.hp =
                p.maxHp;

            p.hunger =
                70;

            p.thirst =
                70;

            p.energy =
                80;

            p.radiation =
                Math.max(
                    0,
                    p.radiation - 10
                );


            p.position.x = 0;
            p.position.y = 0;


            if (window.showToast) {

                showToast(
                    `💀 Ты погиб. Потеряно Scrap: ${lostScrap}`
                );

            }


            this.update();

            this.save();

        },


        /* =================================================
           FULL HEAL / RESET
        ================================================= */

        resetStats() {

            const p = player();

            if (!p) return;


            p.hp =
                p.maxHp;

            p.hunger =
                100;

            p.thirst =
                100;

            p.energy =
                100;

            p.radiation =
                0;


            this.update();

            this.save();


            if (window.showToast) {

                showToast(
                    "✨ Состояние восстановлено"
                );

            }

        },


        /* =================================================
           PLAYER INFO
        ================================================= */

        getInfo() {

            const p = player();

            if (!p)
                return null;


            return {

                hp: p.hp,
                maxHp: p.maxHp,

                hunger: p.hunger,
                thirst: p.thirst,
                energy: p.energy,

                radiation: p.radiation,

                scrap: p.scrap,

                position: {
                    x: p.position.x,
                    y: p.position.y
                },

                status:
                    this.getStatus(),

                statusText:
                    this.getStatusText()

            };

        },


        /* =================================================
           UI
        ================================================= */

        update() {

            const p = player();

            if (!p)
                return;


            /*
               Основной game.js
               уже умеет обновлять интерфейс.
            */

            if (
                typeof window.updateUI === "function"
            ){

                window.updateUI();

            }


            /*
               Дополнительные элементы,
               если они есть в index.html.
            */

            const setText = (
                id,
                value
            ) => {

                const element =
                    document.getElementById(id);

                if(element)
                    element.textContent = value;

            };


            setText(
                "playerStatus",
                this.getStatusText()
            );


            setText(
                "playerHp",
                Math.round(p.hp)
            );


            setText(
                "playerHunger",
                Math.round(p.hunger)
            );


            setText(
                "playerThirst",
                Math.round(p.thirst)
            );


            setText(
                "playerEnergy",
                Math.round(p.energy)
            );


            setText(
                "playerRadiation",
                Math.round(p.radiation)
            );

        },


        /* =================================================
           SAVE
        ================================================= */

        save() {

            if(
                typeof window.saveGame ===
                "function"
            ){

                window.saveGame();

            }

        }

    };


    /* =====================================================
       CONNECT WITH GAME.JS
    ===================================================== */

    /*
       Передаём обработку тика персонажу.
       Это позволяет постепенно переносить
       механику из game.js в отдельные модули.
    */

    window.PlayerTick = function(){

        if(
            window.Player &&
            typeof Player.tick === "function"
        ){

            Player.tick();

        }

    };


    /* =====================================================
       PUBLIC SHORTCUTS
    ===================================================== */

    window.damagePlayer =
        (amount, reason) =>
            Player.damage(amount, reason);


    window.healPlayer =
        amount =>
            Player.heal(amount);


    window.feedPlayer =
        (amount, name) =>
            Player.eat(amount, name);


    window.drinkPlayer =
        amount =>
            Player.drink(amount);


    window.restPlayer =
        seconds =>
            Player.rest(seconds);


    window.movePlayer =
        (x, y) =>
            Player.move(x, y);


    window.addRadiation =
        amount =>
            Player.addRadiation(amount);


    window.removeRadiation =
        amount =>
            Player.removeRadiation(amount);


    /* =====================================================
       START
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(() => {

                if(
                    window.Game &&
                    window.Player
                ){

                    Player.update();

                }

            }, 50);

        }
    );


})();
