import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  ProgressBar,
  UITransform,
} from "cc";
import { GameManager } from "./GameManager";
import { Hero, HeroData } from "./Hero";
import { BattleMode, TURN } from "./BattleMode";
const { ccclass, property } = _decorator;

@ccclass("HeroSide")
export class HeroSide extends Component {
  @property(Prefab)
  HeroPrefab: Prefab = null;
  @property(GameManager)
  gameManager: GameManager = null;
  @property(Node)
  battleModeNode: Node = null;
  @property(Node)
  enemySide: Node = null;
  private activeHeroes: HeroData[] = [];
  public battleMode: boolean = false;

  initHeroSide() {
    const y0 = this.node.getComponent(UITransform).contentSize.y / 2;
    const padding = 100;
    this.activeHeroes = this.gameManager.herosListInGame.filter(
      (hero) => hero.selected
    );

    this.activeHeroes.forEach((hero, i) => {
      const heroNode = instantiate(this.HeroPrefab);
      heroNode.getComponent(Hero).initHero(hero);
      // heroNode.name = hero.name;
      heroNode.setPosition(
        heroNode.position.x,
        y0 -
          (padding * (i + 1) +
            heroNode.getComponent(UITransform).contentSize.y * i),
        heroNode.position.z
      );
      this.node.addChild(heroNode);
    });
  }

  addBattleButtons() {
    this.node.children.forEach((child) => {
      const heroComponent = child.getComponent(Hero);
      heroComponent.button.node.on(Node.EventType.TOUCH_END, () => {
        this.battleMode
          ? this.heroAttack(
              this.activeHeroes.find(
                (hero) => hero.name === heroComponent.Hero_Name
              )
            )
          : null;
      });
    });
  }

  heroAttack(hero: HeroData) {
    const heroComponent = this.node.children
      .find((node) => node.getComponent(Hero).Hero_Name == hero.name)
      .getComponent(Hero);
    const enemyComponent = this.enemySide
      .getChildByName("Hero")
      .getComponent(Hero);
    this.battleMode = false;
    heroComponent.attack(enemyComponent, () => {
      this.battleMode = true;
      enemyComponent.node
        .getChildByName("BattleMode")
        .getChildByName("HealthBar")
        .getComponent(ProgressBar).progress >= 1
        ? this.battleModeNode.getComponent(BattleMode).passTurn(TURN.END_WIN)
        : this.battleModeNode.getComponent(BattleMode).passTurn(TURN.ENEMY);
    });
  }

  getRandomTargetNameFromHeroes() {
    const validActiveHeroes = this.node.children.filter(
      (hero) =>
        hero
          .getChildByName("BattleMode")
          .getChildByName("HealthBar")
          .getComponent(ProgressBar).progress < 1
    );
    const index =
      validActiveHeroes.length == 1
        ? 0
        : Math.floor(Math.random() * validActiveHeroes.length);
    return validActiveHeroes[index].getComponent(Hero).Hero_Name;
  }

  isPartyAlive() {
    return this.node.children.some(
      (hero) =>
        hero
          .getChildByName("BattleMode")
          .getChildByName("HealthBar")
          .getComponent(ProgressBar).progress < 1
    );
  }

  addExp() {}

  protected async onEnable(): Promise<void> {
    await this.initHeroSide();
    await this.addBattleButtons();
  }

  protected async onDisable(): Promise<void> {
    await this.node.destroyAllChildren();
    this.activeHeroes = [];
    this.battleMode = false;
  }
}
