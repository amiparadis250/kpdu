import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Phone, Building, IdCard, Clock, CheckCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface PendingRegistration {
  id: string;
  type: 'member' | 'candidate';
  name: string;
  email: string;
  phone: string;
  branch: string;
  memberId?: string;
  position?: string;
  status: 'pending' | 'sent' | 'confirmed';
  createdAt: Date;
}

interface EmailConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: PendingRegistration | null;
  onConfirmSend: (registration: PendingRegistration) => void;
}

export function EmailConfirmationDialog({ 
  open, 
  onOpenChange, 
  registration,
  onConfirmSend 
}: EmailConfirmationDialogProps) {
  const [isSending, setIsSending] = useState(false);

  if (!registration) return null;

  const handleSendConfirmation = async () => {
    setIsSending(true);
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onConfirmSend(registration);
    setIsSending(false);
    onOpenChange(false);
    
    toast.success(
      `Confirmation email sent to ${registration.email}`,
      {
        description: 'The user must confirm their details before registration is complete.'
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Confirmation Email
          </DialogTitle>
          <DialogDescription>
            Review the registration details before sending a confirmation email to the {registration.type}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge 
              variant="outline" 
              className={
                registration.status === 'pending' ? 'border-warning text-warning' :
                registration.status === 'sent' ? 'border-primary text-primary' :
                'border-success text-success'
              }
            >
              {registration.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {registration.status === 'sent' && <Send className="h-3 w-3 mr-1" />}
              {registration.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
              {registration.status === 'pending' ? 'Awaiting Confirmation Email' :
               registration.status === 'sent' ? 'Confirmation Email Sent' :
               'Registration Confirmed'}
            </Badge>
          </div>

          {/* Registration Details Card */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{registration.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{registration.type}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{registration.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{registration.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{registration.branch}</span>
                </div>
                {registration.memberId && (
                  <div className="flex items-center gap-2 text-sm">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">{registration.memberId}</code>
                  </div>
                )}
                {registration.position && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{registration.position}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Email Preview */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">Email Preview</p>
              <div className="text-xs text-muted-foreground space-y-2 bg-muted/50 p-3 rounded-lg">
                <p><strong>To:</strong> {registration.email}</p>
                <p><strong>Subject:</strong> Confirm Your KMPDU Registration</p>
                <div className="border-t pt-2 mt-2">
                  <p>Dear {registration.name},</p>
                  <p className="mt-1">Please verify your registration details and click the confirmation link to complete your registration.</p>
                  {registration.memberId && (
                    <p className="mt-1">Your Membership ID: <strong>{registration.memberId}</strong></p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendConfirmation}
            disabled={isSending}
            className="gap-2"
          >
            {isSending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Confirmation Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
