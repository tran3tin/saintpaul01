// src/hooks/useForm.js

import { useState, useCallback } from "react";

const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  /**
   * Handle input blur
   */
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate field on blur
      if (validationSchema) {
        validateField(name, values[name]);
      }
    },
    [values, validationSchema]
  );

  /**
   * Set field value
   */
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Set field error
   */
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  /**
   * Set field touched
   */
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  /**
   * Validate single field
   */
  const validateField = useCallback(
    async (name, value) => {
      if (!validationSchema) return true;

      try {
        await validationSchema.validateAt(name, { [name]: value });
        setFieldError(name, undefined);
        return true;
      } catch (error) {
        setFieldError(name, error.message);
        return false;
      }
    },
    [validationSchema, setFieldError]
  );

  /**
   * Validate all fields
   */
  const validateForm = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.inner.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [values, validationSchema]);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(
    (onSubmit) => {
      return async (e) => {
        if (e) {
          e.preventDefault();
        }

        setIsSubmitting(true);

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        setTouched(allTouched);

        // Validate form
        const isValid = await validateForm();

        if (isValid) {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error("Form submission error:", error);
          }
        }

        setIsSubmitting(false);
      };
    },
    [values, validateForm]
  );

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Set multiple values
   */
  const updateValues = useCallback((newValues) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  /**
   * Set all errors at once
   */
  const setAllErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  /**
   * Set all touched at once
   */
  const setAllTouched = useCallback((newTouched) => {
    setTouched(newTouched);
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setAllErrors,
    setAllTouched,
    updateValues,
    resetForm,
    validateField,
    validateForm,
  };
};

export default useForm;
