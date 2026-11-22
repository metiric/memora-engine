# Атрибуция / Attribution

> **Черновик для обсуждения / Draft for review.** Этот документ не является лицензией и не предоставляет право на использование / This document is not a license and does not grant permission to use the software.

## Русский

Предлагаемое обязательное условие: приложение, которое предоставляет конечным пользователям функции Memora Engine или его модифицированной версии, показывает в своём интерфейсе надпись **Powered by Memora Engine**. Подходящее место — подвал, экран «О приложении» или раздел «Авторы и лицензии», если он легко доступен пользователю и выбранная лицензия допускает такое размещение. Достаточно одной текстовой строки; логотип не требуется. Упоминание в исходниках или README не заменяет надпись в интерфейсе. Локальная разработка и тестирование без интерфейса для конечного пользователя не требуют видимого бейджа. Условия для публичного API или CLI без графического интерфейса нужно определить отдельно, если атрибуция нужна и там.

### Видимость и ссылка

Надпись **Powered by Memora Engine** должна быть кликабельной и вести прямо в официальный репозиторий Memora Engine на GitHub. Она должна читаться при обычном использовании сайта, в том числе на мобильном экране. Подходит видимый подвал или страница «О проекте», на которую есть заметная ссылка в навигации или подвале. Не подходят скрытая страница без ссылки, всплывающая подсказка, исходный код или GitHub README вместо надписи на сайте. Адрес репозитория: https://github.com/metiric/memora-engine (пока закрыт; для публичной атрибуции ссылка должна быть доступна пользователям).

Стандартный вариант для рассмотрения — **CPAL-1.0**: раздел 14 и приложение B позволяют указать фразу и потребовать её отображения в составе более крупного приложения с графическим интерфейсом.[1] У CPAL есть и другие условия, в том числе для распространения исходников и сетевого использования; не следует выбирать её только по наличию бейджа. Заполнять приложение B и добавлять `LICENSE` стоит после выбора условий и подтверждения правообладателя. Не указывайте выдуманный URL репозитория.

## English

Proposed mandatory condition: an application that exposes features powered by Memora Engine, including a modified version, displays **Powered by Memora Engine** in its end-user interface. A footer, About screen, or Credits and Licenses screen is suitable if easily accessible and consistent with the final license. One line of text is enough; no logo is required. A mention in source code or a README is not a substitute for the end-user credit. Local development and testing without an end-user interface do not require a visible badge. Attribution for a public API or CLI without a graphical interface should be specified separately if needed.

### Visibility and link

**Powered by Memora Engine** must be a clickable link directly to the official Memora Engine repository on GitHub. The text must be readable in normal use, including on mobile. A visible footer or a Project/About page clearly linked from the navigation or footer is acceptable. An unlinked page, a hover-only tooltip, source code, or the GitHub README alone does not satisfy the proposed requirement. Repository: https://github.com/metiric/memora-engine (currently private; the attribution link must be accessible to users when published).

One standard option to review is **CPAL-1.0**. Section 14 and Exhibit B provide for an attribution phrase and let the licensor require its display in larger works with a graphical interface.[1] CPAL also has terms governing source distribution and network use, so the badge is not the only obligation. Complete Exhibit B and add `LICENSE` after the terms and rights holder are confirmed. Do not use a guessed repository URL.

## Sources

[1] https://spdx.org/licenses/CPAL-1.0.html
