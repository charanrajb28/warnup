import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import InputZone from "./InputZone";

describe("InputZone Component", () => {
  it("renders text input tab by default", () => {
    const mockOnTextChange = vi.fn();
    const mockOnFileChange = vi.fn();

    render(
      <InputZone 
        onTextChange={mockOnTextChange} 
        onFileChange={mockOnFileChange} 
        placeholder="Custom placeholder typing..."
      />
    );
    
    // Check if the placeholder is present in the textarea
    expect(screen.getByPlaceholderText(/Custom placeholder typing/i)).toBeTruthy();
  });

  it("switches to file upload tab when clicked", () => {
    const mockOnTextChange = vi.fn();
    const mockOnFileChange = vi.fn();

    render(
      <InputZone 
        onTextChange={mockOnTextChange} 
        onFileChange={mockOnFileChange} 
      />
    );
    
    // Click File Upload tab
    const fileTab = screen.getByText("File Upload");
    fireEvent.click(fileTab);
    
    // Check if dropzone appears
    expect(screen.getByText(/Drag & drop or click to upload/i)).toBeTruthy();
  });

  it("updates text value when typed", () => {
    const mockOnTextChange = vi.fn();
    const mockOnFileChange = vi.fn();

    render(
      <InputZone 
        onTextChange={mockOnTextChange} 
        onFileChange={mockOnFileChange} 
      />
    );
    
    const textarea = screen.getByRole("textbox", { name: /Text input area/i });
    fireEvent.change(textarea, { target: { value: "Patient has high fever" } });
    
    expect(mockOnTextChange).toHaveBeenCalledWith("Patient has high fever");
  });
});
