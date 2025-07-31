import { formatPrice } from "../utils";

describe("formatPrice", () => {
  describe("zero and falsy values", () => {
    it('should return "0" for zero', () => {
      expect(formatPrice(0)).toBe("0");
    });

    it('should return "0" for negative zero', () => {
      expect(formatPrice(-0)).toBe("0");
    });
  });

  describe("large numbers (>= 1)", () => {
    it("should preserve all integer digits and limit decimal places", () => {
      expect(formatPrice(123456.12345, 3)).toBe("123,456.123");
      expect(formatPrice(123456.12345, 2)).toBe("123,456.12");
      expect(formatPrice(123456.12345, 1)).toBe("123,456.1");
    });

    it("should handle numbers without decimal parts", () => {
      expect(formatPrice(123456, 3)).toBe("123,456");
      expect(formatPrice(1000000, 2)).toBe("1,000,000");
    });

    it("should remove trailing zeros from decimal part", () => {
      expect(formatPrice(123456.12, 3)).toBe("123,456.12");
      expect(formatPrice(123456.1, 2)).toBe("123,456.1");
    });

    it("should handle single digit numbers", () => {
      expect(formatPrice(5.12345, 2)).toBe("5.12");
      expect(formatPrice(5, 2)).toBe("5");
    });
  });

  describe("small decimal numbers (< 1)", () => {
    it("should treat precision as significant figures for very small numbers", () => {
      expect(formatPrice(0.00012345, 3)).toBe("0.000123");
      expect(formatPrice(0.00012345, 2)).toBe("0.00012");
      expect(formatPrice(0.00012345, 1)).toBe("0.0001");
    });

    it("should handle numbers with different leading zero counts", () => {
      expect(formatPrice(0.0012345, 3)).toBe("0.00123");
      expect(formatPrice(0.012345, 3)).toBe("0.0123");
      expect(formatPrice(0.12345, 3)).toBe("0.123");
    });

    it("should handle numbers that are exactly at the boundary", () => {
      expect(formatPrice(0.999, 2)).toBe("0.99");
      expect(formatPrice(0.999, 3)).toBe("0.999");
    });
  });

  describe("negative numbers", () => {
    it("should preserve negative sign for large numbers", () => {
      expect(formatPrice(-123456.12345, 3)).toBe("-123,456.123");
      expect(formatPrice(-123456, 2)).toBe("-123,456");
    });

    it("should preserve negative sign for small numbers", () => {
      expect(formatPrice(-0.00012345, 3)).toBe("-0.000123");
      expect(formatPrice(-0.12345, 2)).toBe("-0.12");
    });
  });

  describe("edge cases", () => {
    it("should handle very large numbers", () => {
      expect(formatPrice(999999999.12345, 2)).toBe("999,999,999.12");
    });

    it("should handle very small numbers", () => {
      expect(formatPrice(0.00000012345, 3)).toBe("0.000000123");
    });

    it("should handle numbers with many trailing zeros", () => {
      expect(formatPrice(123.0, 3)).toBe("123");
      expect(formatPrice(0.123, 3)).toBe("0.123");
    });

    it("should handle numbers that round to zero significant digits", () => {
      expect(formatPrice(0.0000123, 1)).toBe("0.00001");
    });
  });

  describe("default precision", () => {
    it("should use default precision of 2 when not specified", () => {
      expect(formatPrice(123.456)).toBe("123.45");
      expect(formatPrice(0.12345)).toBe("0.12");
    });
  });

  describe("precision variations", () => {
    it("should handle precision of 0", () => {
      expect(formatPrice(123.456, 0)).toBe("123");
      expect(formatPrice(0.12345, 0)).toBe("0");
    });

    it("should handle high precision", () => {
      expect(formatPrice(123.456789, 5)).toBe("123.45678");
      expect(formatPrice(0.123456789, 5)).toBe("0.12345");
    });
  });

  describe("floating point precision issues", () => {
    it("should handle common floating point precision issues", () => {
      expect(formatPrice(0.1 + 0.2, 2)).toBe("0.3");
      const value = 0.3 - 0.1;
      expect(formatPrice(value, 2)).toBe("0.2");
    });
  });
});
