import { _decorator, Component, Node } from "cc";
import { HeroSide } from "./HeroSide";
import { EnemySide } from "./EnemySide";
import { Hero } from "./Hero";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

export enum TURN {
  START,
  HEROES,
  ENEMY,
  END_WIN,
  END_LOSE,
}

@ccclass("BattleMode")
export class BattleMode extends Component {
  private enemySide: Node = null;
  private heroesSide: Node = null;
  private endBattleMessage: Node = null;
  private fightCounter: number = 0;
  @property(GameManager)
  GameManager: GameManager = null;
  onLoad() {
    this.node.children.forEach((child) => (child.active = true));
    this.enemySide = this.node.getChildByName("EnemySide");
    this.heroesSide = this.node.getChildByName("HeroesSide");
    this.endBattleMessage = this.node.getChildByName("EndBattleMessage");
    this.passTurn(TURN.START);
  }

  protected start(): void {
    this.passTurn(TURN.HEROES);
  }

  passTurn(turn: TURN) {
    switch (turn) {
      case TURN.START:
        this.endBattleMessage.active = false;
        this.heroesSide.active = true;
        this.enemySide.active = true;
        this.endBattleMessage.getChildByName("WinMessage").active = false;
        this.endBattleMessage.getChildByName("LoseMessage").active = false;
        break;
      case TURN.HEROES:
        this.heroesSide.getComponent(HeroSide).battleMode = true;
        this.enemySide.getComponent(EnemySide).battleMode = false;
        break;
      case TURN.ENEMY:
        this.heroesSide.getComponent(HeroSide).battleMode = false;
        this.enemySide.getComponent(EnemySide).battleMode = true;
        break;
      case TURN.END_WIN:
        this.assignExp(() => {
          setTimeout(() => {
            this.endBattle();
            this.endBattleMessage.getChildByName("WinMessage").active = true;
          }, 100);
        });
        break;
      case TURN.END_LOSE:
        this.endBattle();
        this.endBattleMessage.getChildByName("LoseMessage").active = true;
        break;
      default:
        break;
    }
  }

  assignExp(callback: () => void) {
    this.fightCounter++;
    this.heroesSide.children.forEach(async (child) => {
      if (child.getComponent(Hero).isAlive()) {
        await child.getComponent(Hero).addExpAnim(callback);
        this.GameManager.expHero(child.getComponent(Hero).Hero_Name);
      }
    });
    if (this.fightCounter == 5) {
      this.fightCounter = 0;
      this.GameManager.unlockRandomHero();
    }
  }

  endBattle() {
    this.endBattleMessage.active = true;
    this.heroesSide.active = false;
    this.enemySide.active = false;
  }

  protected async onEnable(): Promise<void> {
    await this.passTurn(TURN.START);
    await this.passTurn(TURN.HEROES);
  }
}
