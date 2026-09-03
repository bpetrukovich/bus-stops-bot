import { DOMParser } from "linkedom";
import type { ParsedTransport } from "../Transport";
import { MinutesParser } from "./MinutesParser";

class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParsingError";
  }
}

export class LinkedomParser {
  parse(htmlString: string): ParsedTransport[] {
    const document = new DOMParser().parseFromString(htmlString, "text/html");
    if (!document) {
      throw new ParsingError("Failed to parse HTML document.");
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

    const transports: ParsedTransport[] = [];

    const infoLines = document.querySelectorAll(".info .info-line");
    if (infoLines.length === 0) {
      throw new ParsingError(
        "No transport rows matching '.info .info-line' were found.",
      );
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
}
