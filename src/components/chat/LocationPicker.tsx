import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (lat: number, lng: number, label: string) => void;
}

const LocationPicker = ({ open, onOpenChange, onSend }: LocationPickerProps) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      setLocation(null);

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
        },
        () => {
          setError("Unable to get your location. Please allow location access.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [open]);

  const handleSend = () => {
    if (location) {
      const label = `📍 ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
      onSend(location.lat, location.lng, label);
      onOpenChange(false);
    }
  };

  const mapUrl = location
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.005},${location.lat - 0.003},${location.lng + 0.005},${location.lat + 0.003}&layer=mapnik&marker=${location.lat},${location.lng}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Share Location
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[250px] flex items-center justify-center rounded-lg overflow-hidden border border-border bg-muted">
          {loading && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Getting your location...</p>
            </div>
          )}
          {error && (
            <div className="text-center px-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {location && (
            <iframe
              src={mapUrl}
              className="w-full h-[250px] border-0"
              title="Your location"
            />
          )}
        </div>

        {location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Navigation className="h-3 w-3" />
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!location}>
            <MapPin className="h-4 w-4 mr-1" />
            Share Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;
