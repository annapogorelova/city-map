import sinon from "sinon";
import dc from "../../../src/dependency-container/index";
import NamedEntitiesService from "../../../src/services/named-entities/named-entities-service";

describe("NamedEntitiesService test", () => {
    let namedEntitiesService = dc.get("namedEntities");
    let namedEntities = [
        {
            id: 1,
            name: "Максим Кривоніс",
            description: "Макси́м Кривоні́с (Кривонос, або Перебійніс також Перейбийніс; близько 1600 — 1648)  — український військовий діяч періоду Хмельниччини, лисянський полковник, один з керівників козацько-селянських повстань в Україні під час Хмельниччини. Учасник Корсунської битви, літньої подільської та осінньої волинсько-галицької кампаній 1648 року. Уперше в історії Львова взяв штурмом Високий замок.",
            wikiUrl: "https://uk.wikipedia.org/wiki/%D0%9C%D0%B0%D0%BA%D1%81%D0%B8%D0%BC_%D0%9A%D1%80%D0%B8%D0%B2%D0%BE%D0%BD%D1%96%D1%81",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/Kozak.gif",
            tags: []
        },
        {
            id: 2,
            name: "Микола Миклухо-Маклай",
            description: "Миклу́хо-Макла́й Мико́ла Микола́йович (5 (17) липня 1846, село Язикове, Новгородська губернія — 2 (14) квітня 1888, Санкт-Петербург) — відомий мандрівник, антрополог, етнограф, географ; дослідник народів Південно-Східної Азії, Австралії й Океанії; автор близько 160 наукових праць; українського походження з козацького роду Миклух. Був підданим Російської імперії, але майже все своє свідоме життя провів поза її межами, де й зробив свої знакові дослідження та відкриття.",
            wikiUrl: "https://uk.wikipedia.org/wiki/%D0%9C%D0%B8%D0%BA%D0%BB%D1%83%D1%85%D0%BE-%D0%9C%D0%B0%D0%BA%D0%BB%D0%B0%D0%B9_%D0%9C%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0_%D0%9C%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B9%D0%BE%D0%B2%D0%B8%D1%87",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/Miklukho-Maklai.jpg",
            tags: []
        },
        {
            id: 3,
            name: "Іван Франко",
            description: "Іва́н Я́кович Фра́нко́ (27 серпня 1856, с. Нагуєвичі — 28 травня 1916, Львів, Австро-Угорщина) — видатний український письменник, поет, публіцист, перекладач, учений, громадський і політичний діяч. Доктор філософії (1893), дійсний член Наукового товариства імені Шевченка (1899), почесний доктор Харківського університету (1906)[1][2].",
            wikiUrl: "https://uk.wikipedia.org/wiki/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD_%D0%AF%D0%BA%D0%BE%D0%B2%D0%B8%D1%87",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD.jpg",
            tags: [{name: "письменники"}, {name: "поети"}]
        }
    ];

    it("should create the instance of NamedEntitiesService", (done) => {
        let api = dc.get("api");
        let namedEntitiesService = new NamedEntitiesService(api);

        expect(namedEntitiesService.apiService).to.not.equal(undefined);

        done();
    });

    it("should search named entities", (done) => {
        let apiServiceStub = sinon.stub(namedEntitiesService.apiService, "get").resolves({data: namedEntities});
        let params = {offset: 10, limit: 10};

        namedEntitiesService.search(params).then((response) => {
            expect(apiServiceStub.calledWithMatch("/namedEntities", params)).to.equal(true);
            expect(response.data).to.equal(namedEntities);

            apiServiceStub.restore();

            done();
        });
    });

    it("should call the api post method", (done) => {
        let apiServiceStub = sinon.stub(namedEntitiesService.apiService, "post").resolves();

        namedEntitiesService.create(namedEntities[0]).then(() => {
            expect(apiServiceStub.calledOnceWith("/namedEntities", namedEntities[0])).to.equal(true);

            apiServiceStub.restore();

            done();
        });
    });

    it("should call the api put method", (done) => {
        let apiServiceStub = sinon.stub(namedEntitiesService.apiService, "put").resolves();

        namedEntitiesService.update(namedEntities[0]).then(() => {
            expect(apiServiceStub.calledOnceWith(`/namedEntities/${namedEntities[0].id}`, namedEntities[0])).to.equal(true);

            apiServiceStub.restore();

            done();
        });
    });

    it("should call the api delete method", (done) => {
        let apiServiceStub = sinon.stub(namedEntitiesService.apiService, "delete").resolves();

        namedEntitiesService.remove(namedEntities[0].id).then(() => {
            expect(apiServiceStub.calledOnceWith(`/namedEntities/${namedEntities[0].id}`)).to.equal(true);

            apiServiceStub.restore();

            done();
        });
    });
});