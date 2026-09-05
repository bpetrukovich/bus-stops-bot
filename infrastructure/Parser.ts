import { DOMParser } from "linkedom";
import type { ParsedTransport } from "../Transport";
import { MinutesParser } from "./MinutesParser";
import { WrongBusstopError } from "../application/ReminderService";

export class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParsingError";
  }
}

export class LinkedomParser {
  parse(htmlString: string): ParsedTransport[] {
    const document = new DOMParser().parseFromString(htmlString, "text/html");

    this.validate(document);

    const stopName = document.querySelector(".stop-name").textContent.trim();
    const infoLines = document.querySelectorAll(".info .info-line");

    const transports: ParsedTransport[] = [];

    if (infoLines.length === 0) {
      return [];
    }

    for (let i = 0; i < infoLines.length; i++) {
      const line = infoLines[i];
      const cells = line.children;

      if (cells.length < 4) {
        throw new ParsingError(
          `Row at index ${i} is invalid. Expected at least 4 cells, but found ${cells.length}.`,
        );
      }

      const getCellText = (cell: any, fieldName: string): string => {
        const text = cell.textContent?.trim();
        if (!text) {
          throw new ParsingError(
            `Row at index ${i} has an empty or missing value for the '${fieldName}' field.`,
          );
        }
        return text;
      };

      const minutes = new Set<number>();
      const nearestMinutes = MinutesParser.parse(
        getCellText(cells[2], "nearest"),
      );
      const followingMinutes = MinutesParser.parse(
        getCellText(cells[3], "following"),
      );
      if (nearestMinutes) {
        minutes.add(nearestMinutes);
      }
      if (followingMinutes) {
        minutes.add(followingMinutes);
      }

      transports.push({
        stopName,
        name: getCellText(cells[0], "number"),
        destination: getCellText(cells[1], "destination"),
        minutes,
      });
    }

    return transports;
  }

  getStopName(htmlString: string): string {
    const document = new DOMParser().parseFromString(htmlString, "text/html");
    this.validate(document);

    return document.querySelector(".stop-name").textContent.trim();
  }

  validate(document: any): void {
    if (!document) {
      throw new ParsingError("Failed to parse HTML document.");
    }

    const errorElement = document.querySelector(".err-head");
    if (errorElement) {
      throw new WrongBusstopError(`Wrong busstop.`);
    }

    const stopNameElement = document.querySelector(".stop-name");
    if (!stopNameElement) {
      throw new ParsingError("Required element '.stop-name' was not found.");
    }

    const stopName = stopNameElement.textContent?.trim();
    if (!stopName) {
      throw new ParsingError(
        "The '.stop-name' element is empty or missing text content.",
      );
    }
  }
}
