import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const kycSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  occupation: z.string().min(1, 'Occupation is required'),
  sourceOfFunds: z.string().min(1, 'Source of funds is required'),
});

type KycFormData = z.infer<typeof kycSchema>;

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KycModal: React.FC<KycModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'documents' | 'submitted'>('form');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { user, submitKyc, isSubmittingKyc } = useAuth();
  const { toast } = useToast();

  const form = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      dateOfBirth: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      phoneNumber: '',
      occupation: '',
      sourceOfFunds: '',
    },
  });

  const handleFormSubmit = (data: KycFormData) => {
    setStep('documents');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKycSubmit = async () => {
    try {
      const formData = form.getValues();
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        submitData.append(`document_${index}`, file);
      });

      await submitKyc(submitData);
      setStep('submitted');
      
      toast({
        title: 'KYC Submitted',
        description: 'Your KYC information has been submitted for review.',
      });
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setStep('form');
    setUploadedFiles([]);
    form.reset();
    onClose();
  };

  const renderFormStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...form.register('lastName')}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...form.register('dateOfBirth')}
          />
          {form.formState.errors.dateOfBirth && (
            <p className="text-sm text-destructive">{form.formState.errors.dateOfBirth.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Enter your full address"
            {...form.register('address')}
          />
          {form.formState.errors.address && (
            <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...form.register('city')}
            />
            {form.formState.errors.city && (
              <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...form.register('country')}
            />
            {form.formState.errors.country && (
              <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              {...form.register('postalCode')}
            />
            {form.formState.errors.postalCode && (
              <p className="text-sm text-destructive">{form.formState.errors.postalCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              {...form.register('phoneNumber')}
            />
            {form.formState.errors.phoneNumber && (
              <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            {...form.register('occupation')}
          />
          {form.formState.errors.occupation && (
            <p className="text-sm text-destructive">{form.formState.errors.occupation.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceOfFunds">Source of Funds</Label>
          <Textarea
            id="sourceOfFunds"
            placeholder="Describe your source of funds for trading"
            {...form.register('sourceOfFunds')}
          />
          {form.formState.errors.sourceOfFunds && (
            <p className="text-sm text-destructive">{form.formState.errors.sourceOfFunds.message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Next: Upload Documents
          </Button>
        </div>
      </form>
    </motion.div>
  );

  const renderDocumentsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Upload Required Documents</h3>
          <p className="text-muted-foreground text-sm">
            Please upload clear photos or scans of the following documents:
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Required Documents:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Government-issued photo ID (passport, driver's license, or national ID)</li>
              <li>• Proof of address (utility bill, bank statement, or lease agreement)</li>
              <li>• Bank statement or proof of income (last 3 months)</li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Upload Documents</p>
              <p className="text-xs text-muted-foreground">
                Drag and drop files here, or click to select
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Select Files
              </Button>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Uploaded Files:</h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('form')}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleKycSubmit}
            disabled={uploadedFiles.length === 0 || isSubmittingKyc}
            className="flex-1"
          >
            {isSubmittingKyc ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit KYC'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderSubmittedStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-4"
    >
      <div className="mx-auto w-16 h-16 bg-profit/10 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-profit" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">KYC Submitted Successfully</h3>
        <p className="text-muted-foreground">
          Your KYC information has been submitted for review. We'll notify you via email once the review is complete.
        </p>
        <p className="text-sm text-muted-foreground">
          Review typically takes 1-3 business days.
        </p>
      </div>

      <Button onClick={handleClose} className="w-full">
        Done
      </Button>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'form' && 'KYC Verification - Personal Information'}
            {step === 'documents' && 'KYC Verification - Document Upload'}
            {step === 'submitted' && 'KYC Verification Complete'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'form' && renderFormStep()}
          {step === 'documents' && renderDocumentsStep()}
          {step === 'submitted' && renderSubmittedStep()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};