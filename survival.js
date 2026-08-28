/* =========================================================
   WASTELAND — SURVIVAL
   survival.js
   Выживание: HP / голод / жажда / энергия / радиация
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       SETTINGS
    ===================================================== */

    const SETTINGS = {

        maxHp: 100,

        maxHunger: 100,

        maxThirst: 100,

        maxEnergy: 100,

        maxRadiation: 100,

        minTemperature: -30,

        maxTemperature: 45,

        tick: 5000,

        hungerLoss: 1,

        thirstLoss: 2,

        energyRecovery: 2,

        starvationDamage: 3,

        dehydrationDamage: 5,

        radiationDamage: 2

    };


    window.SurvivalSettings =
        SETTINGS;


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

        render();

    };


    const clamp = (
        value,
        min,
        max
    ) =>
        Math.max(
            min,
            Math.min(
                max,
                value
            )
        );


    /* =====================================================
       INITIALIZE PLAYER
    ===================================================== */

    function initPlayer(){

        const p =
            player();


        if(!p)
            return;


        if(
            typeof p.maxHp !==
            "number"
        ){

            p.maxHp =
                SETTINGS.maxHp;

        }


        if(
            typeof p.hp !==
            "number"
        ){

            p.hp =
                p.maxHp;

        }


        if(
            typeof p.hunger !==
            "number"
        ){

            p.hunger =
                SETTINGS.maxHunger;

        }


        if(
            typeof p.thirst !==
            "number"
        ){

            p.thirst =
                SETTINGS.maxThirst;

        }


        if(
            typeof p.energy !==
            "number"
        ){

            p.energy =
                SETTINGS.maxEnergy;

        }


        if(
            typeof p.maxEnergy !==
            "number"
        ){

            p.maxEnergy =
                SETTINGS.maxEnergy;

        }


        if(
            typeof p.radiation !==
            "number"
        ){

            p.radiation =
                0;

        }


        if(
            typeof p.temperature !==
            "number"
        ){

            p.temperature =
                20;

        }


        if(
            typeof p.alive !==
            "boolean"
        ){

            p.alive =
                true;

        }


        if(
            typeof p.deaths !==
            "number"
        ){

            p.deaths =
                0;

        }


        if(
            typeof p.kills !==
            "number"
        ){

            p.kills =
                0;

        }

    }


    /* =====================================================
       SURVIVAL API
    ===================================================== */

    window.Survival = {


        /* -------------------------------------------------
           GET STATUS
        ------------------------------------------------- */

        status(){

            const p =
                player();


            if(!p)
                return null;


            return {

                hp:
                    p.hp,

                maxHp:
                    p.maxHp,

                hunger:
                    p.hunger,

                thirst:
                    p.thirst,

                energy:
                    p.energy,

                maxEnergy:
                    p.maxEnergy,

                radiation:
                    p.radiation,

                temperature:
                    p.temperature,

                alive:
                    p.alive

            };

        },


        /* -------------------------------------------------
           DAMAGE
        ------------------------------------------------- */

        damage(
            amount,
            reason = "Урон"
        ){

            const p =
                player();


            if(!p || !p.alive)
                return false;


            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );


            p.hp =
                clamp(
                    p.hp - amount,
                    0,
                    p.maxHp
                );


            toast(
                `❤️ ${reason}: -${Math.round(amount)} HP`
            );


            if(
                p.hp <= 0
            ){

                this.die(
                    reason
                );

            }


            update();

            return true;

        },


        /* -------------------------------------------------
           HEAL
        ------------------------------------------------- */

        heal(
            amount
        ){

            const p =
                player();


            if(
                !p ||
                !p.alive
            ){

                return false;

            }


            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );


            const old =
                p.hp;


            p.hp =
                clamp(
                    p.hp + amount,
                    0,
                    p.maxHp
                );


            const healed =
                p.hp - old;


            if(
                healed > 0
            ){

                toast(
                    `❤️ +${Math.round(healed)} HP`
                );

            }


            update();

            save();


            return healed > 0;

        },


        /* -------------------------------------------------
           HUNGER
        ------------------------------------------------- */

        eat(
            amount = 20
        ){

            const p =
                player();


            if(
                !p ||
                !p.alive
            ){

                return false;

            }


            p.hunger =
                clamp(
                    p.hunger + amount,
                    0,
                    SETTINGS.maxHunger
                );


            toast(
                `🍖 Голод +${amount}`
            );


            update();

            save();


            return true;

        },


        /* -------------------------------------------------
           THIRST
        ------------------------------------------------- */

        drink(
            amount = 30
        ){

            const p =
                player();


            if(
                !p ||
                !p.alive
            ){

                return false;

            }


            p.thirst =
                clamp(
                    p.thirst + amount,
                    0,
                    SETTINGS.maxThirst
                );


            toast(
                `💧 Жажда +${amount}`
            );


            update();

            save();


            return true;

        },


        /* -------------------------------------------------
           ENERGY
        ------------------------------------------------- */

        useEnergy(
            amount
        ){

            const p =
                player();


            if(
                !p ||
                !p.alive
            ){

                return false;

            }


            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );


            if(
                p.energy < amount
            ){

                toast(
                    "⚡ Недостаточно энергии"
                );

                return false;

            }


            p.energy =
                clamp(
                    p.energy - amount,
                    0,
                    p.maxEnergy
                );


            update();

            return true;

        },


        /* -------------------------------------------------
           RECOVER ENERGY
        ------------------------------------------------- */

        recoverEnergy(
            amount =
                SETTINGS.energyRecovery
        ){

            const p =
                player();


            if(
                !p ||
                !p.alive
            ){

                return false;

            }


            p.energy =
                clamp(
                    p.energy + amount,
                    0,
                    p.maxEnergy
                );


            update();


            return true;

        },


        /* -------------------------------------------------
           RADIATION
        ------------------------------------------------- */

        addRadiation(
            amount
        ){

            const p =
                player();


            if(
                !p ||
                !p.alive
            ){

                return false;

            }


            amount =
                Math.max(
                    0,
                    Number(amount) || 0
                );


            p.radiation =
                clamp(
                    p.radiation + amount,
                    0,
                    SETTINGS.maxRadiation
                );


            toast(
                `☢️ Радиация +${Math.round(amount)}`
            );


            update();

            return true;

        },


        /* -------------------------------------------------
           REMOVE RADIATION
        ------------------------------------------------- */

        removeRadiation(
            amount
        ){

            const p =
                player();


            if(!p)
                return false;


            p.radiation =
                clamp(
                    p.radiation - amount,
                    0,
                    SETTINGS.maxRadiation
                );


            update();

            save();


            return true;

        },


        /* -------------------------------------------------
           TEMPERATURE
        ------------------------------------------------- */

        setTemperature(
            temperature
        ){

            const p =
                player();


            if(!p)
                return false;


            p.temperature =
                clamp(
                    Number(temperature),
                    SETTINGS.minTemperature,
                    SETTINGS.maxTemperature
                );


            update();

            return true;

        },


        /* -------------------------------------------------
           IS STARVING
        ------------------------------------------------- */

        isStarving(){

            const p =
                player();

            return Boolean(
                p &&
                p.hunger <= 0
            );

        },


        /* -------------------------------------------------
           IS DEHYDRATED
        ------------------------------------------------- */

        isDehydrated(){

            const p =
                player();

            return Boolean(
                p &&
                p.thirst <= 0
            );

        },


        /* -------------------------------------------------
           IS RADIATED
        ------------------------------------------------- */

        isRadiated(){

            const p =
                player();

            return Boolean(
                p &&
                p.radiation >= 70
            );

        },


        /* -------------------------------------------------
           DEATH
        ------------------------------------------------- */

        die(
            reason = "Вы погибли"
        ){

            const p =
                player();


            if(
                !p ||
                !p.alive
            ){

                return false;

            }


            p.alive =
                false;


            p.deaths =
                Number(
                    p.deaths || 0
                ) + 1;


            p.hp =
                0;


            toast(
                `☠️ ${reason}`
            );


            if(window.addEvent){

                addEvent(
                    "☠️",
                    "Смерть",
                    reason
                );

            }


            update();


            /*
               Через 3 секунды предлагаем
               возрождение.
            */

            setTimeout(
                () => {

                    this.respawn();

                },
                3000
            );


            save();


            return true;

        },


        /* -------------------------------------------------
           RESPAWN
        ------------------------------------------------- */

        respawn(){

            const p =
                player();


            if(!p)
                return false;


            p.alive =
                true;


            p.hp =
                Math.round(
                    p.maxHp * 0.5
                );


            p.hunger =
                Math.max(
                    30,
                    p.hunger
                );


            p.thirst =
                Math.max(
                    30,
                    p.thirst
                );


            p.energy =
                p.maxEnergy;


            p.radiation =
                Math.max(
                    0,
                    p.radiation - 20
                );


            /*
               Возвращаем на спавн.
            */

            if(
                window.MapSystem?.setPosition
            ){

                MapSystem.setPosition(
                    0,
                    0
                );

            }

            else {

                p.position = {

                    x: 0,

                    y: 0

                };

            }


            toast(
                "🔄 Вы возродились"
            );


            if(window.addEvent){

                addEvent(
                    "🔄",
                    "Возрождение",
                    "Игрок вернулся в мир"
                );

            }


            update();

            save();


            return true;

        }

    };


    /* =====================================================
       SURVIVAL TICK
    ===================================================== */

    function tick(){

        const p =
            player();


        if(
            !p ||
            !p.alive
        ){

            return;

        }


        /*
           Голод.
        */

        p.hunger =
            clamp(
                p.hunger -
                SETTINGS.hungerLoss,
                0,
                SETTINGS.maxHunger
            );


        /*
           Жажда.
        */

        p.thirst =
            clamp(
                p.thirst -
                SETTINGS.thirstLoss,
                0,
                SETTINGS.maxThirst
            );


        /*
           Восстановление энергии.
        */

        if(
            p.hunger > 20 &&
            p.thirst > 20
        ){

            p.energy =
                clamp(
                    p.energy +
                    SETTINGS.energyRecovery,
                    0,
                    p.maxEnergy
                );

        }


        /*
           Голодание.
        */

        if(
            p.hunger <= 0
        ){

            p.hp =
                clamp(
                    p.hp -
                    SETTINGS.starvationDamage,
                    0,
                    p.maxHp
                );


            toast(
                "🍖 Вы голодаете"
            );

        }


        /*
           Обезвоживание.
        */

        if(
            p.thirst <= 0
        ){

            p.hp =
                clamp(
                    p.hp -
                    SETTINGS.dehydrationDamage,
                    0,
                    p.maxHp
                );


            toast(
                "💧 Вы обезвожены"
            );

        }


        /*
           Сильная радиация.
        */

        if(
            p.radiation >= 70
        ){

            p.hp =
                clamp(
                    p.hp -
                    SETTINGS.radiationDamage,
                    0,
                    p.maxHp
                );


            toast(
                "☢️ Радиация наносит урон"
            );

        }


        /*
           Температура.
        */

        if(
            p.temperature <= -10
        ){

            p.energy =
                clamp(
                    p.energy - 2,
                    0,
                    p.maxEnergy
                );

        }


        if(
            p.temperature >= 38
        ){

            p.thirst =
                clamp(
                    p.thirst - 1,
                    0,
                    SETTINGS.maxThirst
                );

        }


        /*
           Смерть.
        */

        if(
            p.hp <= 0
        ){

            Survival.die(
                "Организм не выдержал"
            );

        }


        update();

        save();

    }


    /* =====================================================
       USE BASIC ITEMS
    ===================================================== */

    function setupItems(){

        document
            .querySelectorAll(
                "[data-eat]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            Survival.eat(
                                Number(
                                    button.dataset.eat
                                ) || 20
                            );

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-drink]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            Survival.drink(
                                Number(
                                    button.dataset.drink
                                ) || 30
                            );

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-heal]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            Survival.heal(
                                Number(
                                    button.dataset.heal
                                ) || 20
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       SURVIVAL UI
    ===================================================== */

    function render(){

        const p =
            player();


        if(!p)
            return;


        const values = {

            hp:
                p.hp,

            hunger:
                p.hunger,

            thirst:
                p.thirst,

            energy:
                p.energy,

            radiation:
                p.radiation

        };


        Object.entries(
            values
        ).forEach(
            ([key, value]) => {

                const bars =
                    document.querySelectorAll(
                        `[data-survival="${key}"]`
                    );


                bars.forEach(
                    bar => {

                        const max =
                            key === "hp"
                                ? p.maxHp
                                : key === "energy"
                                    ? p.maxEnergy
                                    : 100;


                        const percent =
                            clamp(
                                (
                                    value /
                                    max
                                ) * 100,
                                0,
                                100
                            );


                        bar.style.width =
                            `${percent}%`;


                        bar.dataset.value =
                            Math.round(value);

                    }
                );


                const texts =
                    document.querySelectorAll(
                        `[data-survival-value="${key}"]`
                    );


                texts.forEach(
                    text => {

                        text.textContent =
                            Math.round(
                                value
                            );

                    }
                );

            }
        );


        const temperature =
            document.querySelector(
                "[data-temperature]"
            );


        if(temperature){

            temperature.textContent =
                `${Math.round(
                    p.temperature
                )}°C`;

        }


        const state =
            document.querySelector(
                "[data-survival-state]"
            );


        if(state){

            if(!p.alive){

                state.textContent =
                    "☠️ МЁРТВ";

            }

            else if(
                p.radiation >= 70
            ){

                state.textContent =
                    "☢️ РАДИАЦИЯ";

            }

            else if(
                p.thirst <= 0
            ){

                state.textContent =
                    "💧 ОБЕЗВОЖИВАНИЕ";

            }

            else if(
                p.hunger <= 0
            ){

                state.textContent =
                    "🍖 ГОЛОД";

            }

            else {

                state.textContent =
                    "● В НОРМЕ";

            }

        }

    }


    /* =====================================================
       TEMPERATURE SIMULATION
    ===================================================== */

    function updateTemperature(){

        const p =
            player();


        if(!p || !p.alive)
            return;


        /*
           Если карта предоставляет
           температуру — используем её.
        */

        const zone =
            window.MapSystem?.getZone?.();


        if(zone){

            switch(zone.id){

                case "desert":

                    p.temperature =
                        randomTemperature(
                            25,
                            40
                        );

                    break;


                case "radiation":

                    p.temperature =
                        randomTemperature(
                            18,
                            35
                        );

                    break;


                case "forest":

                    p.temperature =
                        randomTemperature(
                            10,
                            25
                        );

                    break;


                default:

                    p.temperature =
                        randomTemperature(
                            15,
                            28
                        );

            }

        }

    }


    function randomTemperature(
        min,
        max
    ){

        return (
            Math.random() *
            (max - min)
        ) + min;

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init(){

        initPlayer();

        setupItems();

        render();


        setInterval(
            tick,
            SETTINGS.tick
        );


        setInterval(
            updateTemperature,
            30000
        );

    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                init,
                350
            );

        }
    );


    if(
        document.readyState !==
        "loading"
    ){

        setTimeout(
            init,
            350
        );

    }


})();
