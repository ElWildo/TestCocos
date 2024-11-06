import {
  _decorator,
  Button,
  Component,
  instantiate,
  Node,
  Prefab,
  Sprite,
  UIOpacity,
  UITransform,
} from "cc";
const { ccclass, property } = _decorator;
import { herosList } from "../Data/heroList_data";
import { Hero, HeroData } from "./Hero";

enum GameState {
  INIT,
  HERO_SELECTION,
  BATTLE,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Prefab)
  HeroPrefab: Prefab = null;
  public BattleMode: Node = null;
  public HeroSelection: Node = null;
  public herosListInGame: HeroData[] = [...herosList];

  protected onLoad(): void {
    this.setCurrentGameState(GameState.INIT);
  }

  start() {
    this.setCurrentGameState(GameState.HERO_SELECTION);
  }

  initChildrenRef() {
    this.BattleMode = this.node.getChildByName("BattleMode");
    this.HeroSelection = this.node.getChildByName("HeroSelection");
  }

  setCurrentGameState(value: GameState) {
    switch (value) {
      case GameState.INIT:
        this.initChildrenRef();
        this.initHeroSelection();
      case GameState.HERO_SELECTION:
        this.startHeroSelection();
        break;
      case GameState.BATTLE:
        this.startBattle();
        break;
    }
  }

  startHeroSelection() {
    if (this.HeroSelection) this.HeroSelection.active = true;
    if (this.BattleMode) this.BattleMode.active = false;
  }

  startBattle() {
    if (this.HeroSelection) this.HeroSelection.active = false;
    if (this.BattleMode) this.BattleMode.active = true;
  }

  pressBattleButton() {
    this.setCurrentGameState(GameState.BATTLE);
  }

  returnToSelection() {
    this.setCurrentGameState(GameState.INIT);
    this.HeroSelection.getChildByName("StartPlay").getComponent(
      Button
    ).interactable = false;
    this.resetHeroList();
  }

  toggleHeroSelection(name: string) {
    const heroSel = this.herosListInGame.find((hero) => {
      hero.name == name;
    });
    heroSel.selected = !heroSel.selected;
  }

  unlockRandomHero() {
    const lockedHeros = this.herosListInGame.filter((hero) => !hero.unlocked);
    const randomHeroName =
      lockedHeros[Math.floor(Math.random() * (lockedHeros.length - 1))].name;
    const unlockedHeero = this.herosListInGame.find(
      (hero) => hero.name == randomHeroName
    );
    unlockedHeero.unlocked = true;
  }
  resetHeroList() {
    this.herosListInGame.forEach((hero) => {
      hero.selected = false;
    });
    this.HeroSelection.children.forEach((child) => {
      if (child.name == "Hero")
        child.getChildByName("SelectedBackground").active = false;
    });
  }

  initHeroSelection() {
    if (this.HeroPrefab && this.HeroSelection) {
      this.HeroSelection.children.forEach((child) => {
        if (child.getComponent(Hero)) child.destroy();
      });
      const marginTop = -200;
      const marginLeft = 200;
      const padding = 55;
      const X0 =
        marginLeft -
        this.HeroSelection.getComponent(UITransform).contentSize.x / 2 +
        padding;
      const Y0 =
        marginTop +
        this.HeroSelection.getComponent(UITransform).contentSize.y / 2 +
        padding;
      for (let i = 0; i <= this.herosListInGame.length - 1; i++) {
        const newHero = instantiate(this.HeroPrefab);
        newHero;
        newHero
          .getChildByName("Button")
          .on(Node.EventType.TOUCH_END, () => this.selectHero(newHero, i));
        this.HeroSelection.addChild(newHero);
        newHero.getComponent(Hero).initHero(this.herosListInGame[i]);

        if (i < this.herosListInGame.length / 2) {
          newHero.setPosition(
            X0 +
              padding * i +
              newHero.getComponent(UITransform).contentSize.x / 2 +
              newHero.getComponent(UITransform).contentSize.x * i,
            Y0 - newHero.getComponent(UITransform).contentSize.y / 2,
            newHero.position.z
          );
        } else {
          newHero.setPosition(
            X0 +
              padding * (i - this.herosListInGame.length / 2) +
              newHero.getComponent(UITransform).contentSize.x / 2 +
              newHero.getComponent(UITransform).contentSize.x *
                (i - this.herosListInGame.length / 2),
            Y0 -
              newHero.getComponent(UITransform).contentSize.y / 2 -
              newHero.getComponent(UITransform).contentSize.y * 2,
            newHero.position.z
          );
        }

        if (!this.herosListInGame[i].unlocked) {
          newHero.getChildByName("Body").getComponent(UIOpacity).opacity = 50;
        }
      }
    }
  }

  selectHero(newHero: Node, index: number) {
    if (!this.herosListInGame[index].unlocked) return;
    const infoDisplay = newHero.getChildByName("InfoDisplay");
    const selectedBackground = newHero.getChildByName("SelectedBackground");
    if (!infoDisplay.active) {
      if (
        this.herosListInGame.filter((hero) => hero.selected).length < 3 ||
        this.herosListInGame[index].selected
      ) {
        selectedBackground.active = !selectedBackground.active;
        this.herosListInGame[index].selected = selectedBackground.active;
      }
      this.herosListInGame.filter((hero) => hero.selected).length == 3
        ? (this.HeroSelection.getChildByName("StartPlay").getComponent(
            Button
          ).interactable = true)
        : (this.HeroSelection.getChildByName("StartPlay").getComponent(
            Button
          ).interactable = false);
    }
  }

  expHero(heroName: string) {
    const hero = this.herosListInGame.find((hero) => hero.name == heroName);
    hero.exp++;
    if (hero.exp >= 5) {
      hero.exp = 0;
      hero.health *= 1.1;
      hero.att_power *= 1.1;
      hero.lvl++;
    }
  }

  update(deltaTime: number) {}
}
