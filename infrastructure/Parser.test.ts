import { expect, test } from "bun:test";
import { LinkedomParser } from "./Parser";

test("parse", () => {
  const parser = new LinkedomParser();

  const htmlString = `
<!DOCTYPE html>
<html>

<head>
    <link rel='shortcut icon' type='image/x-icon' href='/favicon.ico' />
    <meta charset='UTF-8' />
    <link rel='stylesheet' href='/css/theme.css' />
    <title>Театральный</title>
</head>

<body>
    <div class='content'>
        <div class='head'>
            <div class='label'>Прибытие на остановочный пункт</div>
            <div class='stop-name'>Театральный</div>
            <div class='info-header info-line'>
                <div style='margin-left:2.125rem'><b>№ ТС</b></div>
                <div><b>Конечная остановка</b></div>
                <div><b>Ближ.</b></div>
                <div><b>След.</b></div>
            </div>
        </div>
        <div class='info'>
            <div class='info-line'>
                <div class='transport TP'>TP3п</div>
                <div>Трамвайный парк</div>
                <div class='nearest'>12 мин.</div>
                <div>21 мин.</div>
            </div>
</body>

</html>`;

  const result = parser.parse(htmlString);

  expect(result).toEqual([
    {
      stopName: "Театральный",
      name: "TP3п",
      destination: "Трамвайный парк",
      minutes: new Set([12, 21]),
    },
  ]);
});
