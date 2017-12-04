'use strict'
import {
    LEGO_COLORS
} from './common/legoColors.js';
import {
    BASE_LEGO_COLOR
} from './common/const.js';
import {
    LegoGridCanvas
} from './canvas/legoCanvas.js';


(function () {

    let gameInit = false, // true if we init the legoGrid
        legoCanvas = null, // The legoGrid
        keys = null, // The keys of firenase submit draw
        snapshotFb = null, // The snapshot of submit draw
        index = 0;


    function initGame() {

        legoCanvas = new LegoGridCanvas('canvasDraw', true);

        $("#color-picker2").spectrum({
            showPaletteOnly: true,
            showPalette: true,
            color: BASE_LEGO_COLOR,
            palette: LEGO_COLORS,
            change: function (color) {
                legoCanvas.changeColor(color.toHexString());
            }
        });
    }

    function pageLoad() {


        /**
         * Management of Cinematic Buttons
         */
        const startBtn = document.getElementById('startBtn');
        const helpBtn = document.getElementById('help')

        const streamStart = Rx.Observable
            .fromEvent(startBtn, 'click')
            .map(() => 'start');

        const streamHelp = Rx.Observable
            .fromEvent(helpBtn, 'click')
            .map(() => 'help');

        streamStart.merge(streamHelp)
            .subscribe((state) => {
                if (state === 'start') {
                    document.getElementById('hello-msg').setAttribute("hidden", "");
                    document.getElementById('game').removeAttribute('hidden');
                    document.getElementById('color-picker2').removeAttribute('hidden');
                    document.getElementById('help').removeAttribute('hidden');
                    if (!gameInit) {
                        document.getElementById('loading').removeAttribute('hidden');
                        // Timeout needed to start the rendering of loading animation (else will not be show)
                        setTimeout(function () {
                            gameInit = true;
                            initGame();
                            document.getElementById('loading').setAttribute('hidden', '')
                        }, 50);
                    }
                } else if (state === 'help') {
                    document.getElementById('hello-msg').removeAttribute("hidden");
                    document.getElementById('game').setAttribute('hidden', "");
                    document.getElementById('color-picker2').setAttribute('hidden', "");
                    document.getElementById('help').setAttribute('hidden', "");
                }
            })


        /**
         * Management of submission
         */

        document.getElementById('btnSubmission').addEventListener('click', () => {
            const user = {
                name: 'User Name',
                id: 'userId'
            };
            const drawDatas = legoCanvas.export(user.name, user.id);
            drawDatas.dataUrl = legoCanvas.snapshot();
            console.info('will send : ', drawDatas);
            const URL = `http://localhost:9000/draw/${user.id}`;
            fetch(URL, {
                    method: 'post',
                    headers: new Headers({
                        'Content-Type': 'application/json; charset=utf-8'
                    }),
                    body: JSON.stringify(drawDatas)
                })
                .then(function (response) {
                    console.info(response);
                });
            legoCanvas.resetBoard();
        });

        /**
         * Management of menu items
         */

        const menuGame = document.getElementById('menu-game');
        const menuCreations = document.getElementById('menu-creations');


        const streamGame = Rx.Observable
            .fromEvent(menuGame, 'click')
            .map(() => 'game');

        const streamCreations = Rx.Observable
            .fromEvent(menuCreations, 'click')
            .map(() => 'creations');

        streamGame.merge(streamCreations)
            .subscribe((state) => {
                if (state === 'game') {
                    document.querySelector('.page-content').removeAttribute('hidden');
                    document.getElementById('submitted').setAttribute('hidden', '');
                    document.getElementById('menu-game').setAttribute('hidden', '');
                    document.getElementById('menu-creations').removeAttribute('hidden');
                    document.querySelector('.mdl-layout__drawer').classList.remove('is-visible');
                    document.querySelector('.mdl-layout__obfuscator').classList.remove('is-visible');

                } else if (state === 'creations') {
                    document.querySelector('.page-content').setAttribute('hidden', '');
                    document.getElementById('submitted').removeAttribute('hidden');
                    document.getElementById('menu-game').removeAttribute('hidden');
                    document.getElementById('menu-creations').setAttribute('hidden', '');
                    document.querySelector('.mdl-layout__drawer').classList.remove('is-visible');
                    document.querySelector('.mdl-layout__obfuscator').classList.remove('is-visible');

                    const user = {
                        name: 'User Name',
                        id: 'userId'
                    };
                    const myInit = {
                        method: 'GET'
                    };
                    const URL = `http://localhost:9000/draw/${user.id}`;
                    fetch(URL, myInit)
                        .then(function (snapshot) {
                            return snapshot.json();
                        })
                        .then(function (snapshot) {
                            if (snapshot) {
                                console.log(snapshot);
                                snapshotFb = snapshot;
                                keys = Object.keys(snapshotFb);
                                index = 0;
                                draw();
                            } else {
                                console.log('no draw !');
                            }
                        });
                }
            });


        /**
         * Management of Buttons for changing of draw
         */

        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');

        const streamBtnLeft = Rx.Observable
            .fromEvent(btnLeft, 'click', () => index = Math.max(index - 1, 0));
        const streamBtnRight = Rx.Observable
            .fromEvent(btnRight, 'click', () => index = Math.min(index + 1, keys.length - 1));

        streamBtnLeft.merge(streamBtnRight).subscribe(draw);


    }

    /**
     * Show a draw and show it's state : Rejected or Accepted
     */
    function draw() {
        let draw = snapshotFb[keys[index]];
        let imgSubmission = document.getElementById('imgSubmission');
        imgSubmission.src = draw.dataUrl;
        if (draw.accepted && !imgSubmission.classList.contains('accepted')) {
            imgSubmission.classList.add('accepted');
        } else {
            imgSubmission.classList.remove('accepted');
        }

    }


    window.addEventListener('load', pageLoad);

    /* SERVICE_WORKER_REPLACE */
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker-phone.js', {
            scope: location.pathname
        }).then(function (reg) {
            console.log('Service Worker Register for scope : %s', reg.scope);
        });
    }
    /*SERVICE_WORKER_REPLACE */

})();