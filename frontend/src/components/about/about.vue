<template>
    <div class="row page-wrapper">
        <div class="col-12">
            <div class="row">
                <div class="col-12 col-lg-5">
                    <div class="main-image"></div>
                </div>
                <div class="col-12 col-lg-7">
                    <h1>Про проект</h1>
                    <p>
                        Вулиці міст України часто називають на честь відомих людей або важливих історичних подій.
                        Усі, імовірно, знають, хто такі Тарас Шевченко, Леся Українка або Іван Франко.
                        Але чи пригадаєте ви, хто такі Степан Смаль-Стоцький, Костянтин Корнякт або Наталія Кобринська?
                        Чи знаєте ви, ким вони були, як виглядали, і за які заслуги на їх честь було названо вулиці?
                    </p>
                    <p>
                        <b>StreetInfo</b> - це інтерактивна карта міста, яка містить інформацію про сотні діячів історії, культури та науки,
                        а також про важливі історичні події, на честь яких названі вулиці.
                    </p>
                    <p>
                        Усі дані про назви вулиць, відомих людей та події взяті з <a href="https://wikipedia.org/">Wikipedia</a>.
                        Геодані було взято з <a href="https://www.openstreetmap.org/">OpenStreetMap</a>.
                    </p>
                    <p>На даний момент проект працює у тестовому режимі і доступний лише для Львова, але у планах є підтримка інших міст України.</p>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .page-wrapper {
        margin-top: 15px !important;
        margin-bottom: 15px !important;
    }

    .main-image {
        width: 100%;
        height: 300px;
        background-image: url("../../../static/images/app-image.jpg");
        background-size: cover;
        background-position: center;
    }

    @media(max-width: 768px) {
        .main-image {
            margin-bottom: 15px;
            height: 200px;
        }
    }
</style>