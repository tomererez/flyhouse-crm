
import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
import { EmptyLeg } from "@/api/entities";
import { EmailCampaign } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getRegionFromPhoneNumber, getAllRegions, airportsByRegion, aircraftTypes, priceRanges, emailTemplates } from "../components/utils/LocationUtils";
import { format } from "date-fns";
import { Dices, Mail, Send, History, Loader2, Sparkles, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CampaignSendModal = ({ isOpen, onClose, campaignData }) => {
  if (!campaignData) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here for better UX, e.g., using a toast library
    alert("Copied to clipboard!"); // Simple alert for demonstration
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Campaign Manually</DialogTitle>
          <DialogDescription>
            Copy the details below into your email client (e.g., Outlook) to send the campaign. Use BCC for the recipient list to protect privacy.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input readOnly value={campaignData.subject} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipients (BCC)</label>
            <div className="relative">
              <Textarea readOnly value={campaignData.recipients} className="h-24 pr-10" />
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(campaignData.recipients)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Body</label>
            <div
              className="p-4 border rounded-md h-64 overflow-y-auto bg-white"
              dangerouslySetInnerHTML={{ __html: campaignData.body }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default function EmailDistribution() {
  const [leads, setLeads] = useState([]);
  const [emptyLegs, setEmptyLegs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedLegs, setSelectedLegs] = useState([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false); // Renamed to isPreparing for clarity in new workflow
  const [isLoading, setIsLoading] = useState(true);

  const [showSendModal, setShowSendModal] = useState(false);
  const [campaignSendData, setCampaignSendData] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await loadLeadsWithRegions();
      await loadEmptyLegs();
      await loadCampaigns();
      setIsLoading(false);
    };
    initialize();
  }, []);

  const loadLeadsWithRegions = async () => {
    const allLeads = await Lead.list();
    const updatedLeads = [];
    let needsUpdate = false;
    for (const lead of allLeads) {
      if (lead.client && !lead.client.location_region) {
        const region = getRegionFromPhoneNumber(lead.client.phone_e164);
        if (region !== 'Unknown' && region !== 'International (Other)') {
            lead.client.location_region = region;
            updatedLeads.push(Lead.update(lead.id, { client: lead.client }));
            needsUpdate = true;
        }
      }
    }
    if (needsUpdate) {
      await Promise.all(updatedLeads);
    }
    // Always re-fetch and set state after potential updates or if no updates were needed
    const freshlyLoadedLeads = await Lead.list();
    setLeads(freshlyLoadedLeads);
    setAvailableRegions(getAllRegions(freshlyLoadedLeads));
  };

  const loadEmptyLegs = async () => setEmptyLegs(await EmptyLeg.list('-created_date'));
  const loadCampaigns = async () => setCampaigns(await EmailCampaign.list('-created_date'));

  const handleGenerateLegs = async () => {
    if (!selectedRegion) {
      alert("Please select a region first.");
      return;
    }
    setIsGenerating(true);
    const newLegs = [];
    const sourceAirports = airportsByRegion[selectedRegion] || airportsByRegion['USA (Other)'];
    const allAirports = Object.values(airportsByRegion).flat();

    for (let i = 0; i < 5; i++) { // Generate 5 legs
      const aircraft = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
      const priceConfig = priceRanges[aircraft];
      
      newLegs.push({
        departure_airport: sourceAirports[Math.floor(Math.random() * sourceAirports.length)],
        arrival_airport: allAirports[Math.floor(Math.random() * allAirports.length)],
        departure_date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        aircraft_type: aircraft,
        price: Math.floor(Math.random() * (priceConfig.max - priceConfig.min + 1)) + priceConfig.min,
        region_tag: selectedRegion
      });
    }

    await EmptyLeg.bulkCreate(newLegs);
    await loadEmptyLegs();
    setIsGenerating(false);
  };

  const handlePrepareCampaign = async () => {
    if (selectedLegs.length === 0 || !selectedRegion) {
      alert("Please select a region and at least one empty leg.");
      return;
    }
    setIsSending(true); // isSending now refers to the preparation state
    
    const targetLeads = leads.filter(l => l.client?.location_region === selectedRegion && l.client?.email);
    const recipientEmails = targetLeads.map(l => l.client.email).join(', ');

    const template = emailTemplates['standard'];
    const legToSend = emptyLegs.find(leg => leg.id === selectedLegs[0]);

    // Use a generic placeholder for the email body preview
    let body = template.body
        .replace('{first_name}', '[Client Name]') // Use placeholder for display in modal
        .replace('{departure_airport}', legToSend.departure_airport)
        .replace('{arrival_airport}', legToSend.arrival_airport)
        .replace('{departure_date}', format(new Date(legToSend.departure_date), 'MMM dd, yyyy'))
        .replace('{aircraft_type}', legToSend.aircraft_type)
        .replace('{price}', legToSend.price.toLocaleString());

    setCampaignSendData({
      subject: template.subject,
      body,
      recipients: recipientEmails,
    });
    
    // Log the campaign as prepared
    await EmailCampaign.create({
      name: `Empty Legs for ${selectedRegion} - ${format(new Date(), 'yyyy-MM-dd')}`,
      region_tag: selectedRegion,
      sent_to_count: targetLeads.length,
      sent_date: new Date().toISOString(), // This now represents the preparation date
      empty_leg_ids: selectedLegs,
      template_used: 'standard'
    });

    await loadCampaigns();
    setSelectedLegs([]);
    setShowSendModal(true);
    setIsSending(false); // Reset isSending
  };

  const toggleLegSelection = (legId) => {
    setSelectedLegs(prev =>
      prev.includes(legId) ? prev.filter(id => id !== legId) : [...prev, legId]
    );
  };
  
  if (isLoading) return <div className="p-6">Loading Email Module...</div>

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Empty Leg Email Distribution</h1>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel: Generation & Sending */}
          <div className="space-y-6">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />1. Generate & Select Empty Legs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger><SelectValue placeholder="Select Client Region" /></SelectTrigger>
                    <SelectContent>
                      {availableRegions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleGenerateLegs} disabled={isGenerating || !selectedRegion}>
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Dices className="w-4 h-4 mr-2" />}
                    Generate for Region
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden card-glass max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Route</TableHead><TableHead>Aircraft</TableHead><TableHead>Price</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {emptyLegs.filter(leg => !selectedRegion || leg.region_tag === selectedRegion).map(leg => (
                        <TableRow key={leg.id}>
                          <TableCell><Checkbox checked={selectedLegs.includes(leg.id)} onCheckedChange={() => toggleLegSelection(leg.id)}/></TableCell>
                          <TableCell>{leg.departure_airport} → {leg.arrival_airport}</TableCell>
                          <TableCell>{leg.aircraft_type}</TableCell>
                          <TableCell>${leg.price.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" />2. Prepare Campaign</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p>You are about to prepare a campaign with <Badge>{selectedLegs.length}</Badge> selected empty leg(s) for all clients in the <Badge>{selectedRegion || 'N/A'}</Badge> region.</p>
                <Button onClick={handlePrepareCampaign} disabled={isSending || selectedLegs.length === 0 || !selectedRegion} className="w-full">
                  {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Prepare Email Campaign
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: History */}
          <Card className="card-glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-green-600" />Campaign History</CardTitle></CardHeader>
            <CardContent className="max-h-[50rem] overflow-y-auto">
               <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Region</TableHead><TableHead>Recipients</TableHead><TableHead>Legs</TableHead></TableRow></TableHeader>
                  <TableBody>
                      {campaigns.map(c => (
                          <TableRow key={c.id}>
                              <TableCell>{format(new Date(c.sent_date), 'MMM d, yyyy')}</TableCell>
                              <TableCell><Badge variant="secondary">{c.region_tag}</Badge></TableCell>
                              <TableCell>{c.sent_to_count}</TableCell>
                              <TableCell>{c.empty_leg_ids?.length || 0}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <CampaignSendModal 
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        campaignData={campaignSendData}
      />
    </>
  );
}
