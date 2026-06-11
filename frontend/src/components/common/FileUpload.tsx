/**
 * @file FileUpload component
 * File picker with preview and size validation
 *
 * @example
 * <FileUpload
 *   label="Upload Image"
 *   accept="image/*"
 *   onFileChange={handleFileChange}
 * />
 *
 * @example
 * // With size limit and preview
 * <FileUpload
 *   label="Upload Profile Photo"
 *   accept="image/png,image/jpeg"
 *   maxSize={5 * 1024 * 1024} // 5MB
 *   preview
 *   onFileChange={setProfileImage}
 * />
 */

import React, { useState, useRef, forwardRef } from 'react';
import { FileUploadProps } from './types';
import { TRANSITIONS } from './constants';

/**
 * FileUpload Component
 *
 * A file input component with preview and validation.
 *
 * @param {FileUploadProps} props - FileUpload component props
 * @returns {React.ReactElement} FileUpload element
 */
const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      accept,
      preview = false,
      maxSize,
      onFileChange,
      error,
      multiple = false,
      disabled = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setLocalError(null);

      // Validate file size
      if (maxSize && selectedFile.size > maxSize) {
        setLocalError(
          `File size exceeds ${(maxSize / 1024 / 1024).toFixed(2)}MB limit`
        );
        onFileChange?.(null);
        return;
      }

      setFile(selectedFile);
      onFileChange?.(selectedFile);

      // Create preview
      if (preview) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    };

    const handleClear = () => {
      setFile(null);
      setPreviewUrl(null);
      setLocalError(null);
      onFileChange?.(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    const inputId = rest.id || `fileupload-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-600"
          >
            {label}
            {rest.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            error || localError
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-slate-300 bg-gray-50 dark:bg-slate-100 hover:border-gray-400 dark:hover:border-slate-500'
          } ${TRANSITIONS.base} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={(el) => {
              if (ref) {
                if (typeof ref === 'function') {
                  ref(el);
                } else {
                  (ref as any).current = el;
                }
              }
              inputRef.current = el;
            }}
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            disabled={disabled}
            className="sr-only"
            aria-invalid={!!(error || localError)}
            aria-describedby={
              error || localError ? `${inputId}-error` : undefined
            }
            {...rest}
          />

          {file ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-900">
                  {file.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>

              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg"
                />
              )}

              <button
                type="button"
                onClick={() => {
                  inputRef.current?.click();
                }}
                className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
              >
                Change file
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="block w-full text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              className="cursor-pointer"
              onClick={() => !disabled && inputRef.current?.click()}
            >
              <svg
                className="mx-auto h-12 w-12 text-slate-500 dark:text-gray-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M32 4v8m0 0h8m-8 0l8-8"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p className="text-sm font-medium text-gray-900 dark:text-slate-900 mt-2">
                Click to upload
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500">
                or drag and drop
              </p>
            </div>
          )}
        </div>

        {(error || localError) && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error || localError}
          </p>
        )}

        {maxSize && !error && !localError && (
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
            Max file size: {(maxSize / 1024 / 1024).toFixed(2)}MB
          </p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;
