import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { generateMatchups, type MatchPair } from './Matchmaker';
import { getFactionsGrouped } from '../../data/warhammer40k';
import { useUnitRegistry } from '../../hooks/useUnitRegistry';
import { getGrandAlliance } from '../../components/TacticalSectorMap';
import { formatCommanderWithDiscord } from '../../utils/commanderUtils';

export interface UnitPoint {
  id: string;
  faction: string;
  unit_name: string;
  base_points: number;
  updated_at: string;
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  theatre_name?: string;
  created_at: string;
}

export interface CampaignVote {
  id: string;
  category: string;
  nominee_id: string;
  voter_id: string;
  profiles?: { commander_name: string };
}

export interface GameStore {
  id: string;
  name: string;
  location?: string;
}

interface EditableMatchup {
  id: string;
  p1_id: string;
  p2_id: string;
  theatre_name?: string;
  p1_score: number | '';
  p2_score: number | '';
  game_result: string;
  status: string;
  p1_temperament: number | '';
  p2_temperament: number | '';
  p1_rules_engagement: number | '';
  p2_rules_engagement: number | '';
  p1_profile?: { commander_name: string; army_faction?: string };
  p2_profile?: { commander_name: string; army_faction?: string };
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [votes, setVotes] = useState<CampaignVote[]>([]);
  const [fetchingVotes, setFetchingVotes] = useState(false);

  const [campaignState, setCampaignState] = useState<any>(null);
  const [campaignMessage, setCampaignMessage] = useState('');

  const [generatedMatches, setGeneratedMatches] = useState<MatchPair[]>([]);
  const [committingMatches, setCommittingMatches] = useState(false);

  // Manual Narrative Pairing
  const [manualP1, setManualP1] = useState('');
  const [manualP2, setManualP2] = useState('');
  const [manualTheatre, setManualTheatre] = useState('');
  const [manualMessage, setManualMessage] = useState('');

  const [stores, setStores] = useState<GameStore[]>([]);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreLoc, setNewStoreLoc] = useState('');

  // Global Events
  const [globalEvents, setGlobalEvents] = useState<GlobalEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventTheatre, setNewEventTheatre] = useState('');
  const [eventMessage, setEventMessage] = useState('');

  // Matchup management
  const [allMatchups, setAllMatchups] = useState<EditableMatchup[]>([]);
  const [editingMatchup, setEditingMatchup] = useState<EditableMatchup | null>(null);
  const [matchupMessage, setMatchupMessage] = useState('');

  // Roster Management
  const [users, setUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userMessage, setUserMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'pause' | 'resume' | 'remove' | 'reinstate', userId: string, userName: string } | null>(null);

  // Map Editor
  const [mapLocations, setMapLocations] = useState<any[]>([]);
  const [fetchingMaps, setFetchingMaps] = useState(false);
  const [selectedMapEditorTheatre, setSelectedMapEditorTheatre] = useState('');
  const [newMapLocationName, setNewMapLocationName] = useState('');
  const [newMapLocationPos, setNewMapLocationPos] = useState<{x: number, y: number} | null>(null);
  const [mapMessage, setMapMessage] = useState('');

  // Unit Points management
  const { unitsByFaction, refreshRegistry } = useUnitRegistry();
  const [unitPoints, setUnitPoints] = useState<UnitPoint[]>([]);
  const [fetchingUP, setFetchingUP] = useState(false);
  const [newUPFaction, setNewUPFaction] = useState('');
  const [newUPUnit, setNewUPUnit] = useState('');
  const [newUPPoints, setNewUPPoints] = useState<number | ''>('');
  const [editingUPId, setEditingUPId] = useState<string | null>(null);
  const [upMessage, setUPMessage] = useState('');

  const GROUPED_FACTIONS = getFactionsGrouped();
  const ALLIANCE_ORDER: ('Imperium' | 'Chaos' | 'Xenos')[] = ['Imperium', 'Chaos', 'Xenos'];

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (profile?.role === 'admin') {
          setIsAdmin(true);
          fetchVotes();
          fetchStores();
          fetchAllMatchups();
          fetchUnitPoints();
          fetchUsers();
          fetchGlobalEvents();
          fetchCampaignState();
          fetchMapLocations();
        }
      }
      setLoading(false);
    });
  }, []);

  const fetchMapLocations = async () => {
    setFetchingMaps(true);
    const { data } = await supabase.from('map_locations').select('*').order('created_at', { ascending: false });
    if (data) setMapLocations(data);
    setFetchingMaps(false);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNewMapLocationPos({ x, y });
    setNewMapLocationName('');
  };

  const handleSaveMapLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapLocationPos || !selectedMapEditorTheatre || !newMapLocationName) return;
    const { error } = await supabase.from('map_locations').insert({
      theatre_name: selectedMapEditorTheatre,
      name: newMapLocationName,
      x_pos: newMapLocationPos.x,
      y_pos: newMapLocationPos.y
    });
    if (error) {
      setMapMessage('Error: ' + error.message);
    } else {
      setMapMessage('Location saved successfully.');
      setNewMapLocationPos(null);
      setNewMapLocationName('');
      fetchMapLocations();
    }
  };

  const handleDeleteMapLocation = async (id: string) => {
    await supabase.from('map_locations').delete().eq('id', id);
    fetchMapLocations();
  };

  const fetchStores = async () => {
    const { data } = await supabase.from('game_stores').select('*').order('name');
    if (data) setStores(data);
  };

  const fetchCampaignState = async () => {
    const { data } = await supabase.from('campaign_state').select('*').single();
    if (data) setCampaignState(data);
  };

  const handleUpdateCampaign = async (field: string, value: number) => {
    setCampaignMessage('');
    const { error } = await supabase.from('campaign_state').update({ [field]: value }).eq('id', 1);
    if (!error) {
      setCampaignMessage(`Successfully updated ${field}.`);
      fetchCampaignState();
    } else {
      setCampaignMessage('Error updating campaign state: ' + error.message);
    }
  };

  const fetchGlobalEvents = async () => {
    try {
      const { data, error } = await supabase.from('global_events').select('*').order('created_at', { ascending: false });
      if (data && !error) setGlobalEvents(data);
    } catch (e) {
      // Table might not exist yet
    }
  };

  const fetchVotes = async () => {
    setFetchingVotes(true);
    const { data, error } = await supabase.from('campaign_votes').select('*, profiles:profiles!campaign_votes_nominee_id_fkey(commander_name)');
    if (!error && data) setVotes(data);
    setFetchingVotes(false);
  };

  const getUserRecord = (userId: string) => {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    allMatchups.forEach(m => {
      if (m.status === 'completed' && m.game_result) {
        if (m.p1_id === userId) {
          if (m.game_result === 'p1_win' || m.game_result === 'P1_WIN') wins++;
          else if (m.game_result === 'p2_win' || m.game_result === 'P2_WIN') losses++;
          else if (m.game_result === 'draw' || m.game_result === 'DRAW') draws++;
        } else if (m.p2_id === userId) {
          if (m.game_result === 'p2_win' || m.game_result === 'P2_WIN') wins++;
          else if (m.game_result === 'p1_win' || m.game_result === 'P1_WIN') losses++;
          else if (m.game_result === 'draw' || m.game_result === 'DRAW') draws++;
        }
      }
    });
    return `${wins}W - ${losses}L${draws > 0 ? ` - ${draws}D` : ''}`;
  };

  const fetchAllMatchups = async () => {
    const { data } = await supabase
      .from('matchups')
      .select('*, p1_profile:profiles!p1_id(commander_name, discord_name, army_faction, private_profiles(discord_name)), p2_profile:profiles!p2_id(commander_name, discord_name, army_faction, private_profiles(discord_name))')
      .order('created_at', { ascending: false });
    if (data) setAllMatchups(data.map(m => ({
      ...m,
      p1_score: m.p1_score ?? '',
      p2_score: m.p2_score ?? '',
      p1_temperament: m.p1_temperament ?? '',
      p2_temperament: m.p2_temperament ?? '',
      p1_rules_engagement: m.p1_rules_engagement ?? '',
      p2_rules_engagement: m.p2_rules_engagement ?? '',
      game_result: m.game_result ?? '',
      status: m.status ?? 'scheduled',
      theatre_name: m.theatre_name ?? ''
    })));
  };

  const fetchUsers = async () => {
    setFetchingUsers(true);
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('id, location, experience_level, army_faction, commander_name, discord_name, payment_status, role, campaign_status, private_profiles(real_name, email)')
      .order('commander_name');

    if (error) {
      setUserMessage('Error fetching users: ' + JSON.stringify(error));
    }
    if (!error && profilesData) {
      const { data: milestonesData } = await supabase
        .from('hobby_milestones')
        .select('user_id, milestone_step');

      const merged = profilesData.map((p: any) => {
        const priv = Array.isArray(p.private_profiles) ? p.private_profiles[0] : p.private_profiles;
        return {
          ...p,
          discord_name: p.discord_name || priv?.discord_name || '',
          real_name: priv?.real_name || '',
          email: priv?.email || '',
          hobby_milestones: (milestonesData || [])
            .filter(m => m.user_id === p.id)
            .map(m => ({ milestone_step: m.milestone_step }))
        };
      });
      setUsers(merged);
    }
    setFetchingUsers(false);
  };

  const handleTogglePayment = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('profiles').update({ payment_status: !currentStatus }).eq('id', userId);
    if (!error) fetchUsers();
  };

  const handleEditUser = (u: any) => {
    setEditingUserId(u.id);
    setEditingUser({ ...u });
    setUserMessage('');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const { error } = await supabase.from('profiles').update({
      commander_name: editingUser.commander_name,
      army_faction: editingUser.army_faction,
      location: editingUser.location,
      experience_level: editingUser.experience_level,
      deployed_location_id: editingUser.deployed_location_id || null,
      deployed_theatre: editingUser.deployed_theatre || null,
    }).eq('id', editingUser.id);
    if (error) {
      setUserMessage('Error: ' + error.message);
    } else {
      setUserMessage('Commander updated successfully.');
      setTimeout(() => {
        setEditingUserId(null);
        setEditingUser(null);
        fetchUsers();
      }, 1000);
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setUserMessage('');
    const newStatus = confirmAction.type === 'remove' ? 'removed' : confirmAction.type === 'pause' ? 'paused' : 'active';
    const { error } = await supabase.from('profiles').update({ campaign_status: newStatus }).eq('id', confirmAction.userId);
    
    if (error) {
      setUserMessage('Error updating user status. Ensure the SQL migration for campaign_status has been run.');
    } else {
      if (newStatus === 'paused' || newStatus === 'removed') {
        await supabase.from('matchups').delete().eq('status', 'scheduled').or(`p1_id.eq.${confirmAction.userId},p2_id.eq.${confirmAction.userId}`);
        fetchAllMatchups();
      }
      fetchUsers();
    }
    setConfirmAction(null);
  };

  const handleGenerateMatches = async () => {
    const { data } = await supabase.from('profiles').select('id, location, experience_level, army_faction, commander_name, preferred_store_id, deployed_theatre, deployed_location_id').eq('campaign_status', 'active');
    if (data) {
      const pairings = generateMatchups(data, campaignState?.current_month || 1);
      setGeneratedMatches(pairings);
    }
  };

  const commitMatches = async () => {
    if (generatedMatches.length === 0) return;
    setMatchupMessage('');
    setCommittingMatches(true);
    const payload = generatedMatches.map(m => ({ 
      p1_id: m.p1.id, 
      p2_id: m.p2.id, 
      status: 'scheduled',
      theatre_name: m.theatre_name 
    }));
    const { error } = await supabase.from('matchups').insert(payload);
    if (!error) {
      for (const m of generatedMatches) {
        await supabase.from('profiles').update({ deployed_theatre: m.theatre_name }).in('id', [m.p1.id, m.p2.id]);
      }
      setMatchupMessage('Matchups actively committed to the Ledger!');
      setGeneratedMatches([]);
      fetchAllMatchups();
    } else {
      setMatchupMessage('Error committing Matchups.');
    }
    setCommittingMatches(false);
  };

  const handleCreateManualPairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualP1 || !manualP2 || manualP1 === manualP2) {
      setManualMessage('Please select two distinct commanders.');
      return;
    }
    const REAL_SECTORS: Record<string, string[]> = {
      'The Hive Spires': ['Outer Wall', 'Hab Districts', 'Merchant Quarter', 'Administratum', 'Spire Apex'],
      'The Ash Wastes': ['Rad Perimeter', 'Nomad Trail', 'Storm Corridor', 'Scavenger Dens', 'Dead Zone'],
      'The Magma Forges': ['Cooling Vents', 'Extraction Bay', 'Foundry Floor', 'Slag Channels', 'Forge Core'],
      'Orbital Relay Station': ['Docking Pylons', 'Comms Array', 'Weapons Battery', 'Engineering Deck', 'Command Bridge'],
      'The Sump Ruins': ['Crater Rim', 'Outer Ruins', 'Collapsed Tunnels', 'Warp Fissure', 'Buried Tomb'],
      'The Toxic Oceans': ['Shore Batteries', 'Tidal Zone', 'Deep Channels', 'Leviathan Depths', 'Abyssal Trench']
    };
    const chosenTheatre = manualTheatre || 'The Ash Wastes';
    const sectorList = REAL_SECTORS[chosenTheatre] || ['Rad Perimeter'];
    const monthIdx = Math.min(Math.max(1, campaignState?.current_month || 1), sectorList.length) - 1;
    const assignedSector = sectorList[monthIdx];
    const fullTheatreName = `${chosenTheatre} - ${assignedSector}`;

    const { error } = await supabase.from('matchups').insert([{
      p1_id: manualP1,
      p2_id: manualP2,
      status: 'scheduled',
      theatre_name: fullTheatreName
    }]);
    if (!error) {
      await supabase.from('profiles').update({ deployed_theatre: fullTheatreName }).in('id', [manualP1, manualP2]);
      setManualMessage('Manual narrative pairing successfully scheduled!');
      setManualP1('');
      setManualP2('');
      setManualTheatre('');
      fetchAllMatchups();
    } else {
      setManualMessage('Error creating manual pairing: ' + error.message);
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName) return;
    await supabase.from('game_stores').insert({ name: newStoreName, location: newStoreLoc });
    setNewStoreName(''); setNewStoreLoc('');
    fetchStores();
  };

  const handleDeleteStore = async (storeId: string) => {
    await supabase.from('game_stores').delete().eq('id', storeId);
    fetchStores();
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDesc) return;
    try {
      const { error } = await supabase.from('global_events').insert({ 
        title: newEventTitle, 
        description: newEventDesc, 
        is_active: false,
        theatre_name: newEventTheatre || null
      });
      if (error) setEventMessage('Error: ' + error.message);
      else {
        setEventMessage('Event queued successfully.');
        setNewEventTitle('');
        setNewEventDesc('');
        setNewEventTheatre('');
        fetchGlobalEvents();
      }
    } catch (err) {
      setEventMessage('Database schema update pending for Events.');
    }
  };

  const handleToggleEvent = async (eventId: string, currentActive: boolean) => {
    try {
      // Allow multiple active events so each theatre can have one
      await supabase.from('global_events').update({ is_active: !currentActive }).eq('id', eventId);
      fetchGlobalEvents();
    } catch (err) {
      setEventMessage('Database schema update pending.');
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await supabase.from('global_events').delete().eq('id', eventId);
      fetchGlobalEvents();
    } catch (err) {}
  };

  const handleEditMatchup = (m: EditableMatchup) => {
    setEditingMatchup({ ...m });
    setMatchupMessage('');
  };

  const handleSaveMatchup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatchup) return;

    const payload: any = {
      p1_id: editingMatchup.p1_id,
      p2_id: editingMatchup.p2_id,
      theatre_name: editingMatchup.theatre_name || null,
      p1_score: editingMatchup.p1_score !== '' ? editingMatchup.p1_score as number : null,
      p2_score: editingMatchup.p2_score !== '' ? editingMatchup.p2_score as number : null,
      game_result: editingMatchup.game_result || null,
      status: editingMatchup.status,
      p1_temperament: editingMatchup.p1_temperament !== '' ? editingMatchup.p1_temperament as number : null,
      p2_temperament: editingMatchup.p2_temperament !== '' ? editingMatchup.p2_temperament as number : null,
      p1_rules_engagement: editingMatchup.p1_rules_engagement !== '' ? editingMatchup.p1_rules_engagement as number : null,
      p2_rules_engagement: editingMatchup.p2_rules_engagement !== '' ? editingMatchup.p2_rules_engagement as number : null,
    };

    const { error } = await supabase.from('matchups').update(payload).eq('id', editingMatchup.id);
    if (error) {
      setMatchupMessage('Error: ' + error.message);
    } else {
      if (editingMatchup.theatre_name) {
        await supabase.from('profiles').update({ deployed_theatre: editingMatchup.theatre_name }).in('id', [editingMatchup.p1_id, editingMatchup.p2_id]);
      }
      setMatchupMessage('Matchup record updated.');
      setEditingMatchup(null);
      fetchAllMatchups();
    }
  };

  const handleDeleteMatchup = async (matchupId: string) => {
    const { error } = await supabase.from('matchups').delete().eq('id', matchupId);
    if (!error) fetchAllMatchups();
  };

  const fetchUnitPoints = async () => {
    setFetchingUP(true);
    const { data } = await supabase.from('unit_points').select('*').order('faction').order('unit_name');
    if (data) setUnitPoints(data);
    setFetchingUP(false);
  };

  const handleAddUnitPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUPFaction || !newUPUnit || newUPPoints === '') {
      setUPMessage('Faction, Unit, and Points are required.');
      return;
    }

    if (editingUPId) {
      const { error } = await supabase.from('unit_points').update({
        faction: newUPFaction,
        unit_name: newUPUnit,
        base_points: newUPPoints
      }).eq('id', editingUPId);

      if (error) {
        setUPMessage('Error: ' + error.message);
      } else {
        setUPMessage(`Successfully updated ${newUPUnit}.`);
        resetUPForm();
        fetchUnitPoints();
        refreshRegistry();
      }
    } else {
      const { error } = await supabase.from('unit_points').upsert({
        faction: newUPFaction,
        unit_name: newUPUnit,
        base_points: newUPPoints
      }, { onConflict: 'faction,unit_name' });

      if (error) {
        setUPMessage('Error: ' + error.message);
      } else {
        setUPMessage(`Successfully registered ${newUPUnit} (${newUPPoints} pts).`);
        resetUPForm();
        fetchUnitPoints();
        refreshRegistry();
      }
    }
  };

  const resetUPForm = () => {
    setNewUPUnit('');
    setNewUPPoints('');
    setEditingUPId(null);
  };

  const handleEditUnitPoint = (up: UnitPoint) => {
    setEditingUPId(up.id);
    setNewUPFaction(up.faction);
    setNewUPUnit(up.unit_name);
    setNewUPPoints(up.base_points);
    setUPMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteUnitPoint = async (id: string) => {
    setUPMessage('');
    const { error } = await supabase.from('unit_points').delete().eq('id', id);
    if (!error) {
      fetchUnitPoints();
      refreshRegistry();
      setUPMessage('Unit deleted from registry.');
    } else {
      setUPMessage('Error deleting unit from registry.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Interrogating Machine Spirit...</div>;

  if (!isAdmin) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', border: '1px solid red' }}>
        <h2 style={{ color: 'red' }}>UNAUTHORIZED: Clearance Denied</h2>
        <p>This path exists strictly for root-level simulation overrides.</p>
      </div>
    );
  }

  const pairedUserIds = new Set<string>();
  allMatchups.forEach(m => {
    if (m.status !== 'cancelled') {
      if (m.p1_id) pairedUserIds.add(m.p1_id);
      if (m.p2_id) pairedUserIds.add(m.p2_id);
    }
  });
  const unassignedUsers = users.filter(u => u.campaign_status !== 'removed' && u.campaign_status !== 'paused' && !pairedUserIds.has(u.id));

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      {confirmAction && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', border: `1px solid ${confirmAction.type === 'remove' ? '#ef4444' : 'var(--theme-accent)'}` }}>
            <h3 style={{ marginBottom: '1rem', color: confirmAction.type === 'remove' ? '#ef4444' : 'var(--theme-accent)' }}>
              {confirmAction.type === 'remove' ? 'Remove Player?' : confirmAction.type === 'pause' ? 'Pause Player?' : confirmAction.type === 'reinstate' ? 'Reinstate Player?' : 'Resume Player?'}
            </h3>
            <p style={{ marginBottom: '2rem' }}>
              Are you sure you want to {confirmAction.type} <strong>{confirmAction.userName}</strong>?
              {confirmAction.type === 'remove' && " This marks them as removed, excluding them from future matchmaking and active roster views."}
              {confirmAction.type === 'pause' && " This pauses their participation in automated matchmaking until resumed."}
              {confirmAction.type === 'reinstate' && " This reinstates them as active, bringing them back into matchmaking and active roster views."}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setConfirmAction(null)} className="btn secondary">Cancel</button>
              <button 
                onClick={executeConfirmAction} 
                className="btn primary" 
                style={confirmAction.type === 'remove' ? { backgroundColor: '#ef4444', color: 'white' } : {}}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 style={{ marginBottom: '1rem' }}>Administration Override Station</h1>

            {/* ========================================= */}
      {/*       CAMPAIGN & LORE MANAGEMENT         */}
      {/* ========================================= */}
{/* ── CAMPAIGN ENGINE CONTROLS ── */}
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--theme-accent)' }}>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--theme-accent)' }}>Global Campaign Engine</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1.5rem' }}>
          Control the progression of the narrative escalation campaign on Vespera Prime.
        </p>

        {campaignMessage && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
            {campaignMessage}
          </div>
        )}

        {campaignState ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)' }}>Current Month (1-5)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  min={1} max={5} 
                  value={campaignState.current_month} 
                  readOnly 
                  style={{ width: '80px', textAlign: 'center', backgroundColor: 'var(--theme-bg)' }} 
                />
                <button onClick={() => handleUpdateCampaign('current_month', Math.max(1, campaignState.current_month - 1))} className="btn secondary">-</button>
                <button onClick={() => handleUpdateCampaign('current_month', Math.min(5, campaignState.current_month + 1))} className="btn secondary">+</button>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)' }}>Escalation Points Limit</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  step={50}
                  value={campaignState.points_limit} 
                  readOnly 
                  style={{ width: '100px', textAlign: 'center', backgroundColor: 'var(--theme-bg)' }} 
                />
                <button onClick={() => handleUpdateCampaign('points_limit', campaignState.points_limit - 50)} className="btn secondary">-</button>
                <button onClick={() => handleUpdateCampaign('points_limit', campaignState.points_limit + 50)} className="btn secondary">+</button>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--theme-fg-muted)' }}>Campaign state not initialized.</p>
        )}
      </div>

      {/* ── GLOBAL EVENTS ENGINE ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Global Events Override</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1rem' }}>
          Trigger narrative conditions. You can now apply events globally or specifically to an individual Theatre of War.
        </p>
        
        {eventMessage && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
            {eventMessage}
          </div>
        )}

        <form onSubmit={handleAddEvent} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <input type="text" placeholder="Event Title (e.g. Warp Storm)" value={newEventTitle}
            onChange={e => setNewEventTitle(e.target.value)} required style={{ flex: 1, padding: '0.75rem', boxSizing: 'border-box', minWidth: '150px' }} />
          <input type="text" placeholder="Narrative Description / Rules" value={newEventDesc}
            onChange={e => setNewEventDesc(e.target.value)} required style={{ flex: 2, padding: '0.75rem', boxSizing: 'border-box', minWidth: '200px' }} />
          <select value={newEventTheatre} onChange={e => setNewEventTheatre(e.target.value)} style={{ padding: '0.75rem', boxSizing: 'border-box' }}>
            <option value="">Global Event (All Theatres)</option>
            <option value="Hive Primus">Hive Primus</option>
            <option value="The Ash Wastes">The Ash Wastes</option>
            <option value="Magma Forges">Magma Forges</option>
            <option value="Orbital Tether">Orbital Tether</option>
            <option value="The Sump">The Sump</option>
            <option value="Rad-Zone Gamma">Rad-Zone Gamma</option>
          </select>
          <button type="submit" className="btn primary">Stage Event</button>
        </form>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {globalEvents.length === 0 && <span style={{ color: 'var(--theme-fg-muted)' }}>No narrative events in the ledger.</span>}
          {globalEvents.map(event => (
            <li key={event.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem', borderBottom: '1px solid var(--theme-border)', backgroundColor: event.is_active ? 'rgba(168, 85, 247, 0.1)' : 'transparent', borderLeft: event.is_active ? '4px solid #a855f7' : '4px solid transparent' }}>
              <div style={{ flex: 1 }}>
                <strong style={{ color: event.is_active ? '#a855f7' : 'var(--theme-fg)', fontSize: '1.1rem' }}>{event.title}</strong>
                {event.theatre_name && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '2px 6px', backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-accent)', border: '1px solid var(--theme-accent)', borderRadius: '4px' }}>{event.theatre_name}</span>}
                {event.is_active && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#a855f7', color: 'white', borderRadius: '4px', textTransform: 'uppercase' }}>Active</span>}
                <div style={{ color: 'var(--theme-fg-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>{event.description}</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => handleToggleEvent(event.id, event.is_active)}
                  style={{ backgroundColor: event.is_active ? 'transparent' : '#a855f7', color: event.is_active ? '#a855f7' : 'white', border: `1px solid ${event.is_active ? '#a855f7' : 'transparent'}`, padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                  {event.is_active ? 'Deactivate' : 'Trigger'}
                </button>
                <button onClick={() => handleDeleteEvent(event.id)}
                  style={{ backgroundColor: 'transparent', color: 'red', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── MAP EDITOR ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Interactive Map Editor</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1rem' }}>
          Define precise tactical points on the territory maps. Click on the map to drop a pin, then name it. You can deploy commanders directly to these locations.
        </p>

        {mapMessage && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
            {mapMessage}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Select Theatre of War to Edit</label>
          <select value={selectedMapEditorTheatre} onChange={e => { setSelectedMapEditorTheatre(e.target.value); setNewMapLocationPos(null); }} style={{ padding: '0.5rem', width: '300px' }}>
            <option value="">-- Choose Theatre --</option>
            <option value="The Hive Spires">The Hive Spires</option>
            <option value="The Magma Forges">The Magma Forges</option>
            <option value="The Sump Ruins">The Sump Ruins</option>
            <option value="The Ash Wastes">The Ash Wastes</option>
            <option value="The Toxic Oceans">The Toxic Oceans</option>
            <option value="Orbital Defense Grid">Orbital Defense Grid</option>
          </select>
        </div>

        {selectedMapEditorTheatre && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }}>
              {(() => {
                const imgMap: any = {
                  'The Hive Spires': 'map_hive_spires.png',
                  'The Magma Forges': 'map_magma_forges.png',
                  'The Sump Ruins': 'map_sump_ruins.png',
                  'The Ash Wastes': 'map_ash_wastes.png',
                  'The Toxic Oceans': 'map_toxic_oceans.png',
                  'Orbital Defense Grid': 'map_orbital_defense.png'
                };
                return (
                  <div 
                    onClick={handleMapClick}
                    style={{ 
                      position: 'relative', 
                      width: '100%', 
                      paddingBottom: '60%', 
                      backgroundImage: `url(/images/${imgMap[selectedMapEditorTheatre]})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center', 
                      borderRadius: '8px', 
                      border: '2px solid var(--theme-border)', 
                      cursor: 'crosshair',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)' 
                    }}
                  >
                    {mapLocations.filter(ml => ml.theatre_name === selectedMapEditorTheatre).map(ml => (
                      <div key={ml.id} title={ml.name} style={{
                        position: 'absolute', top: `${ml.y_pos}%`, left: `${ml.x_pos}%`, transform: 'translate(-50%, -50%)',
                        width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--theme-accent)', border: '2px solid white', zIndex: 5
                      }} />
                    ))}
                    
                    {newMapLocationPos && (
                      <div style={{
                        position: 'absolute', top: `${newMapLocationPos.y}%`, left: `${newMapLocationPos.x}%`, transform: 'translate(-50%, -50%)',
                        width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid white', zIndex: 10,
                        boxShadow: '0 0 10px #ef4444'
                      }} />
                    )}
                  </div>
                );
              })()}
            </div>
            
            <div style={{ flex: '1 1 300px' }}>
              {newMapLocationPos ? (
                <form onSubmit={handleSaveMapLocation} className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--theme-bg-secondary)' }}>
                  <h3 style={{ marginTop: 0 }}>Save New Location</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--theme-fg-muted)' }}>X: {newMapLocationPos.x.toFixed(2)}%, Y: {newMapLocationPos.y.toFixed(2)}%</p>
                  <input type="text" placeholder="Location Name (e.g. Sector Alpha)" value={newMapLocationName} onChange={e => setNewMapLocationName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn primary">Save Location</button>
                    <button type="button" onClick={() => setNewMapLocationPos(null)} className="btn secondary">Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ padding: '1rem', border: '1px dashed var(--theme-border)', borderRadius: '8px', color: 'var(--theme-fg-muted)', textAlign: 'center' }}>
                  Click anywhere on the map to drop a new tactical pin.
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <h3>Registered Locations</h3>
                {fetchingMaps ? <p>Loading...</p> : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {mapLocations.filter(ml => ml.theatre_name === selectedMapEditorTheatre).length === 0 && <span style={{ color: 'var(--theme-fg-muted)' }}>No locations defined for this theatre.</span>}
                    {mapLocations.filter(ml => ml.theatre_name === selectedMapEditorTheatre).map(ml => (
                      <li key={ml.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--theme-border)' }}>
                        <span>{ml.name}</span>
                        <button onClick={() => handleDeleteMapLocation(ml.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

            {/* ========================================= */}
      {/*            ROSTER & VENUES              */}
      {/* ========================================= */}
{/* ── CAMPAIGN ROSTER & PAYMENTS ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Campaign Roster & Payments</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1.5rem' }}>
          Manage entry fees and review registered commanders.
        </p>
        
        {userMessage && (
          <div style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px' }}>
            {userMessage}
          </div>
        )}

        {fetchingUsers ? (
          <p>Awaiting Astropathic Relay...</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--theme-fg-muted)' }}>No commanders registered yet.</p>
        ) : (
          <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--theme-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Commander</th>
                <th style={{ padding: '0.5rem' }}>Real Name</th>
                <th style={{ padding: '0.5rem' }}>Discord</th>
                <th style={{ padding: '0.5rem' }}>Faction</th>
                <th style={{ padding: '0.5rem' }}>Location</th>
                <th style={{ padding: '0.5rem' }}>Deployment</th>
                <th style={{ padding: '0.5rem' }}>Milestones Reached</th>
                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Payment Status</th>
                <th style={{ padding: '0.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <React.Fragment key={u.id}>
                  <tr style={{ borderBottom: '1px solid var(--theme-border)', opacity: u.campaign_status === 'removed' ? 0.5 : 1 }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>
                      {u.commander_name || '—'}
                      {u.role === 'admin' && <span style={{ marginLeft: '6px', fontSize: '0.65rem', padding: '2px 4px', backgroundColor: 'var(--theme-accent)', color: 'white', borderRadius: '4px' }}>ADMIN</span>}
                      {u.campaign_status === 'paused' && <span style={{ marginLeft: '6px', fontSize: '0.65rem', padding: '2px 4px', backgroundColor: '#eab308', color: '#000', borderRadius: '4px' }}>PAUSED</span>}
                      {u.campaign_status === 'removed' && <span style={{ marginLeft: '6px', fontSize: '0.65rem', padding: '2px 4px', backgroundColor: '#ef4444', color: 'white', borderRadius: '4px' }}>REMOVED</span>}
                    </td>
                    <td style={{ padding: '0.5rem', color: 'var(--theme-fg-muted)' }}>{u.real_name || '—'}</td>
                    <td style={{ padding: '0.5rem', color: 'var(--theme-fg-muted)' }}>{u.discord_name || '—'}</td>
                    <td style={{ padding: '0.5rem' }}>{u.army_faction || '—'}</td>
                    <td style={{ padding: '0.5rem', color: 'var(--theme-fg-muted)' }}>{u.location || '—'}</td>
                    <td style={{ padding: '0.5rem', color: 'var(--theme-accent)', fontWeight: 'bold' }}>{u.deployed_theatre || 'Undeployed'}</td>
                    <td style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                      {u.hobby_milestones && u.hobby_milestones.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {u.hobby_milestones.map((hm: any) => (
                            <span key={hm.milestone_step} style={{ backgroundColor: 'var(--theme-accent)', color: 'white', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                              {hm.milestone_step}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--theme-fg-muted)' }}>No progress</span>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleTogglePayment(u.id, !!u.payment_status)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: u.payment_status ? '#166534' : 'var(--theme-bg)',
                          color: u.payment_status ? 'white' : 'var(--theme-fg)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        {u.payment_status ? 'PAID' : 'UNPAID'}
                      </button>
                    </td>
                    <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button onClick={() => handleEditUser(u)} className="btn secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Edit</button>
                      
                      {u.campaign_status === 'removed' ? (
                        <button 
                          onClick={() => setConfirmAction({ type: 'reinstate', userId: u.id, userName: u.commander_name || 'Unknown' })} 
                          className="btn secondary" 
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderColor: '#3b82f6', color: '#3b82f6' }}
                        >
                          Reinstate
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => setConfirmAction({ type: u.campaign_status === 'paused' ? 'resume' : 'pause', userId: u.id, userName: u.commander_name || 'Unknown' })} 
                            className="btn secondary" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderColor: u.campaign_status === 'paused' ? '#22c55e' : '#eab308', color: u.campaign_status === 'paused' ? '#22c55e' : '#eab308' }}
                          >
                            {u.campaign_status === 'paused' ? 'Resume' : 'Pause'}
                          </button>
                          
                          <button 
                            onClick={() => setConfirmAction({ type: 'remove', userId: u.id, userName: u.commander_name || 'Unknown' })} 
                            className="btn secondary" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderColor: '#ef4444', color: '#ef4444' }}
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {editingUserId === u.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: '1rem', backgroundColor: 'var(--theme-bg-alt)' }}>
                        <form onSubmit={handleSaveUser} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                          <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Commander Name</label>
                            <input type="text" value={editingUser.commander_name || ''} onChange={e => setEditingUser({ ...editingUser, commander_name: e.target.value })} required style={{ width: '100%', padding: '0.5rem' }} />
                          </div>
                          <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Army Faction</label>
                            <select value={editingUser.army_faction || ''} onChange={e => setEditingUser({ ...editingUser, army_faction: e.target.value })} required style={{ width: '100%', padding: '0.5rem' }}>
                              <option value="">Select Faction...</option>
                              {Object.keys(unitsByFaction).sort().map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                          <div style={{ flex: '1 1 150px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Location</label>
                            <input type="text" value={editingUser.location || ''} onChange={e => setEditingUser({ ...editingUser, location: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                          </div>
                          <div style={{ flex: '1 1 150px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Experience</label>
                            <select value={editingUser.experience_level || ''} onChange={e => setEditingUser({ ...editingUser, experience_level: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="experienced">Experienced</option>
                            </select>
                          </div>
                          <div style={{ flex: '1 1 150px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Deployment</label>
                            <select value={editingUser.deployed_theatre || ''} onChange={e => setEditingUser({ ...editingUser, deployed_theatre: e.target.value, deployed_location_id: null })} style={{ width: '100%', padding: '0.5rem' }}>
                              <option value="">Undeployed</option>
                              <option value="The Hive Spires">The Hive Spires</option>
                              <option value="The Magma Forges">The Magma Forges</option>
                              <option value="The Sump Ruins">The Sump Ruins</option>
                              <option value="The Ash Wastes">The Ash Wastes</option>
                              <option value="The Toxic Oceans">The Toxic Oceans</option>
                              <option value="Orbital Relay Station">Orbital Relay Station</option>
                            </select>
                          </div>
                          {editingUser.deployed_theatre && (
                            <div style={{ flex: '1 1 150px' }}>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Specific Location</label>
                              <select value={editingUser.deployed_location_id || ''} onChange={e => setEditingUser({ ...editingUser, deployed_location_id: e.target.value || null })} style={{ width: '100%', padding: '0.5rem' }}>
                                <option value="">Random Deployment (Scattered)</option>
                                {mapLocations.filter(ml => ml.theatre_name === editingUser.deployed_theatre).map(ml => (
                                  <option key={ml.id} value={ml.id}>{ml.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="btn primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                            <button type="button" onClick={() => setEditingUserId(null)} className="btn secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                          </div>
                          {userMessage && <div style={{ width: '100%', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>{userMessage}</div>}
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SANCTIONED VENUES ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Sanctioned Venue Control (Game Stores)</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1rem' }}>
          Manage global store endpoints where physical operations map via Registration forms.
        </p>
        <form onSubmit={handleAddStore} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <input type="text" placeholder="Store Name" value={newStoreName}
            onChange={e => setNewStoreName(e.target.value)} required style={{ flex: 1, padding: '0.75rem', boxSizing: 'border-box' }} />
          <input type="text" placeholder="Location (Optional)" value={newStoreLoc}
            onChange={e => setNewStoreLoc(e.target.value)} style={{ flex: 1, padding: '0.75rem', boxSizing: 'border-box' }} />
          <button type="submit" className="btn primary">Add Venue</button>
        </form>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {stores.length === 0 && <span style={{ color: 'var(--theme-fg-muted)' }}>No Active Stores Connected...</span>}
          {stores.map(store => (
            <li key={store.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--theme-border)' }}>
              <div>
                <strong>{store.name}</strong>
                {store.location && <span style={{ color: 'var(--theme-fg-muted)', marginLeft: '0.5rem' }}>({store.location})</span>}
              </div>
              <button onClick={() => handleDeleteStore(store.id)}
                style={{ backgroundColor: 'transparent', color: 'red', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

            {/* ========================================= */}
      {/*         MATCHMAKING & PAIRINGS          */}
      {/* ========================================= */}
{/* ── MATCHMAKING & PAIRINGS MANAGEMENT ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Matchups & Pairings Management</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1.5rem' }}>
          Generate algorithmic pairings, create manual narrative matchups, and override match results.
        </p>

        {matchupMessage && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
            {matchupMessage}
          </div>
        )}

<button onClick={handleGenerateMatches} className="btn secondary" style={{ marginBottom: '1rem' }}>
          Simulate Pairings via Algorithm
        </button>
        {generatedMatches.length > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--theme-border)' }}>
            <h3>Proposed Round Ledgers (Editable Before Locking)</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
              {generatedMatches.map((m, idx) => (
                <li key={idx} style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--theme-bg-secondary)', borderRadius: '4px', borderLeft: '4px solid var(--theme-accent)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>Player 1</label>
                      <select
                        value={m.p1.id}
                        onChange={e => {
                          const u = users.find(user => user.id === e.target.value);
                          if (u) {
                            setGeneratedMatches(prev => prev.map((match, i) => i === idx ? { ...match, p1: u } : match));
                          }
                        }}
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem' }}
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.commander_name} ({u.army_faction})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>Player 2</label>
                      <select
                        value={m.p2.id}
                        onChange={e => {
                          const u = users.find(user => user.id === e.target.value);
                          if (u) {
                            setGeneratedMatches(prev => prev.map((match, i) => i === idx ? { ...match, p2: u } : match));
                          }
                        }}
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem' }}
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.commander_name} ({u.army_faction})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>War Zone</label>
                      <input
                        type="text"
                        value={m.theatre_name || ''}
                        onChange={e => setGeneratedMatches(prev => prev.map((match, i) => i === idx ? { ...match, theatre_name: e.target.value } : match))}
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setGeneratedMatches(prev => prev.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Remove Pair
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>{m.p1.commander_name || 'Unknown'}</strong> [{m.p1.army_faction || 'No Faction'}] (Record: {getUserRecord(m.p1.id)}) <span style={{ color: 'var(--theme-accent)', fontWeight: 'bold', margin: '0 0.5rem' }}>VS</span> <strong>{m.p2.commander_name || 'Unknown'}</strong> [{m.p2.army_faction || 'No Faction'}] (Record: {getUserRecord(m.p2.id)})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--theme-fg-muted)', margin: '0.25rem 0' }}>
                    Locations: {m.p1.location || '?'} vs {m.p2.location || '?'}, Tiers: {m.p1.experience_level} vs {m.p2.experience_level} <span style={{ color: 'gray', marginLeft: '0.5rem' }}>[Fit Score: {m.score}]</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', padding: '4px 8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.85rem', color: '#60a5fa' }}>
                    📍 Deployed War Zone: <strong style={{ color: '#fff' }}>{m.theatre_name}</strong> <span style={{ marginLeft: '8px', color: '#fbbf24' }}>[{(campaignState?.current_month || 1) * 400} PTS]</span>
                  </div>
                </li>
              ))}
            </ul>
            {(() => {
              const proposedUserIds = new Set<string>();
              generatedMatches.forEach(m => {
                if (m.p1.id) proposedUserIds.add(m.p1.id);
                if (m.p2.id) proposedUserIds.add(m.p2.id);
              });
              const unproposed = users.filter(u => u.campaign_status !== 'removed' && u.campaign_status !== 'paused' && !proposedUserIds.has(u.id));
              if (unproposed.length > 0) {
                return (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '4px', color: '#fca5a5', fontSize: '0.85rem' }}>
                    <strong>⚠️ Left Out of Algorithm Simulation ({unproposed.length}):</strong>
                    <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                      {unproposed.map(u => (
                        <li key={u.id}>
                          <strong>{u.commander_name}</strong> [{u.army_faction || 'No Faction'}] (Record: {getUserRecord(u.id)})
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '0.5rem', color: '#fecaca' }}>
                      Once you lock in these initial pairings, any unassigned commander(s) will remain visible in <strong>Active Pairings Overview</strong> and can be paired immediately using <strong>Manual Narrative Pairing</strong> below.
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            <button onClick={commitMatches} disabled={committingMatches} className="btn primary">
              {committingMatches ? 'Committing to Postgres...' : 'Lock Initial Pairings'}
            </button>
          </div>
        )}

        {/* Manual Narrative Pairing Form */}
        <div id="manual-narrative-pairing-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--theme-border)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Manual Narrative Pairing</h3>
          <p style={{ color: 'var(--theme-fg-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Assign specific commanders based on campaign narrative. Enforces Grand Alliance guidelines: Imperial forces never fight one another, and Xenos factions do not fight against the exact same Xenos faction (e.g., Tyranids vs Tyranids).
          </p>
          {manualMessage && (
            <div style={{ padding: '0.75rem', marginBottom: '1rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
              {manualMessage}
            </div>
          )}
          {(() => {
            const p1Obj = users.find(u => u.id === manualP1);
            const p2Obj = users.find(u => u.id === manualP2);
            const p1All = p1Obj ? getGrandAlliance(p1Obj.army_faction) : null;
            const p2All = p2Obj ? getGrandAlliance(p2Obj.army_faction) : null;

            let banner = null;
            if (p1All && p2All) {
              if (p1All === 'Imperium' && p2All === 'Imperium') {
                banner = <div style={{ padding: '0.5rem', marginBottom: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', fontSize: '0.85rem', borderRadius: '4px' }}>⚠️ Narrative Alert: Imperium vs Imperium detected. Campaign rules forbid Imperial infighting!</div>;
              } else if (p1All === 'Xenos' && p2All === 'Xenos') {
                if (p1Obj?.army_faction && p2Obj?.army_faction && p1Obj.army_faction.toLowerCase() === p2Obj.army_faction.toLowerCase()) {
                  banner = <div style={{ padding: '0.5rem', marginBottom: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', fontSize: '0.85rem', borderRadius: '4px' }}>⚠️ Narrative Alert: Exact same Xenos faction pairing detected ({p1Obj.army_faction} vs {p2Obj.army_faction}). Campaign rules forbid identical Xenos infighting!</div>;
                }
              } else if (p1All === 'Chaos' && p2All === 'Chaos') {
                banner = <div style={{ padding: '0.5rem', marginBottom: '1rem', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid #eab308', fontSize: '0.85rem', borderRadius: '4px' }}>ℹ️ Narrative Notice: Chaos vs Chaos detected. Allowed under narrative alignment guidelines.</div>;
              }
            }

            return (
              <>
                {banner}
                <form onSubmit={handleCreateManualPairing} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Player 1</label>
                    <select value={manualP1} onChange={e => setManualP1(e.target.value)} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}>
                      <option value="">Select Commander...</option>
                      {users.filter(u => u.campaign_status !== 'removed').map(u => {
                        const isPaired = pairedUserIds.has(u.id);
                        const statusLabel = isPaired ? ' [Already Paired]' : ' [UNASSIGNED]';
                        return (
                          <option key={u.id} value={u.id}>{u.commander_name} [{u.army_faction || 'No Faction'}]{statusLabel} (Record: {getUserRecord(u.id)})</option>
                        );
                      })}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Player 2</label>
                    <select value={manualP2} onChange={e => setManualP2(e.target.value)} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}>
                      <option value="">Select Commander...</option>
                      {users.filter(u => u.campaign_status !== 'removed').map(u => {
                        const isPaired = pairedUserIds.has(u.id);
                        const statusLabel = isPaired ? ' [Already Paired]' : ' [UNASSIGNED]';
                        return (
                          <option key={u.id} value={u.id}>{u.commander_name} [{u.army_faction || 'No Faction'}]{statusLabel} (Record: {getUserRecord(u.id)})</option>
                        );
                      })}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Theatre of War</label>
                    <select value={manualTheatre} onChange={e => setManualTheatre(e.target.value)} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}>
                      <option value="">Default (The Ash Wastes)</option>
                      <option value="The Hive Spires">The Hive Spires</option>
                      <option value="The Magma Forges">The Magma Forges</option>
                      <option value="The Sump Ruins">The Sump Ruins</option>
                      <option value="The Ash Wastes">The Ash Wastes</option>
                      <option value="The Toxic Oceans">The Toxic Oceans</option>
                      <option value="Orbital Relay Station">Orbital Relay Station</option>
                    </select>
                  </div>
                  <button type="submit" className="btn primary" style={{ padding: '0.6rem 1.25rem' }}>Schedule Pairing</button>
                </form>
              </>
            );
          })()}
        </div>

        
{/* Edit form */}
        {editingMatchup && (
          <div style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid var(--theme-accent)', borderRadius: '6px', backgroundColor: 'var(--theme-bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>
                Editing Matchup Override
              </h3>
              <button onClick={() => setEditingMatchup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--theme-fg-muted)' }}>✕ Cancel</button>
            </div>
            <form onSubmit={handleSaveMatchup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--theme-border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Player 1</label>
                  <select
                    value={editingMatchup.p1_id}
                    onChange={e => {
                      const u = users.find(user => user.id === e.target.value);
                      setEditingMatchup(prev => prev ? {
                        ...prev,
                        p1_id: e.target.value,
                        p1_profile: u ? { commander_name: u.commander_name, army_faction: u.army_faction } : prev.p1_profile
                      } : null);
                    }}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.commander_name} ({u.army_faction})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Player 2</label>
                  <select
                    value={editingMatchup.p2_id}
                    onChange={e => {
                      const u = users.find(user => user.id === e.target.value);
                      setEditingMatchup(prev => prev ? {
                        ...prev,
                        p2_id: e.target.value,
                        p2_profile: u ? { commander_name: u.commander_name, army_faction: u.army_faction } : prev.p2_profile
                      } : null);
                    }}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.commander_name} ({u.army_faction})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Assigned War Zone</label>
                  <input
                    type="text"
                    value={editingMatchup.theatre_name || ''}
                    onChange={e => setEditingMatchup(prev => prev ? { ...prev, theatre_name: e.target.value } : null)}
                    placeholder="e.g. The Hive Spires - Outer Wall"
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>
                    {editingMatchup.p1_profile?.commander_name || 'Player 1'} VP
                  </label>
                  <input type="number" min={0}
                    value={editingMatchup.p1_score}
                    onChange={e => setEditingMatchup(prev => prev ? { ...prev, p1_score: parseInt(e.target.value) || '' } : null)}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>
                    {editingMatchup.p2_profile?.commander_name || 'Player 2'} VP
                  </label>
                  <input type="number" min={0}
                    value={editingMatchup.p2_score}
                    onChange={e => setEditingMatchup(prev => prev ? { ...prev, p2_score: parseInt(e.target.value) || '' } : null)}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Result</label>
                  <select
                    value={editingMatchup.game_result}
                    onChange={e => setEditingMatchup(prev => prev ? { ...prev, game_result: e.target.value } : null)}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  >
                    <option value="">— None —</option>
                    <option value="p1_win">{editingMatchup.p1_profile?.commander_name || 'Player 1'} Wins</option>
                    <option value="p2_win">{editingMatchup.p2_profile?.commander_name || 'Player 2'} Wins</option>
                    <option value="draw">Draw</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Status</label>
                  <select
                    value={editingMatchup.status}
                    onChange={e => setEditingMatchup(prev => prev ? { ...prev, status: e.target.value } : null)}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--theme-accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>Honour Ratings (1–5)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {[
                  { key: 'p1_temperament' as const, label: `${editingMatchup.p1_profile?.commander_name || 'P1'} Temperament` },
                  { key: 'p1_rules_engagement' as const, label: `${editingMatchup.p1_profile?.commander_name || 'P1'} Spirit` },
                  { key: 'p2_temperament' as const, label: `${editingMatchup.p2_profile?.commander_name || 'P2'} Temperament` },
                  { key: 'p2_rules_engagement' as const, label: `${editingMatchup.p2_profile?.commander_name || 'P2'} Spirit` },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>{label}</label>
                    <input type="number" min={1} max={5}
                      value={editingMatchup[key]}
                      onChange={e => setEditingMatchup(prev => prev ? { ...prev, [key]: parseInt(e.target.value) || '' } : null)}
                      style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn primary" style={{ alignSelf: 'flex-start' }}>Save Override</button>
            </form>
          </div>
        )}

        
{/* Active Pairings Overview right inside Matchmaking Engine */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--theme-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Active Pairings Overview ({allMatchups.length})</h3>
          </div>
          {allMatchups.length === 0 && unassignedUsers.length === 0 ? (
            <p style={{ color: 'var(--theme-fg-muted)', fontSize: '0.85rem' }}>No active pairings committed yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--theme-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Player 1</th>
                    <th style={{ padding: '0.5rem' }}>Player 2</th>
                    <th style={{ padding: '0.5rem' }}>War Zone</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Score</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Result</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.5rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {allMatchups.map(m => {
                    const p1Obj = m.p1_profile || users.find(u => u.id === m.p1_id);
                    const p1Name = formatCommanderWithDiscord(p1Obj, 'Unknown');
                    const p1Faction = p1Obj?.army_faction || 'No Faction';
                    const p2Obj = m.p2_profile || users.find(u => u.id === m.p2_id);
                    const p2Name = formatCommanderWithDiscord(p2Obj, 'Unknown');
                    const p2Faction = p2Obj?.army_faction || 'No Faction';
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <strong>{p1Name}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--theme-accent)' }}>[{p1Faction}]</span>
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <strong>{p2Name}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--theme-accent)' }}>[{p2Faction}]</span>
                        </td>
                        <td style={{ padding: '0.5rem', color: '#60a5fa' }}>{m.theatre_name || 'Undeployed'}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--theme-fg-muted)' }}>
                          {m.p1_score !== '' ? m.p1_score : '—'} : {m.p2_score !== '' ? m.p2_score : '—'}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--theme-fg-muted)' }}>
                          {m.game_result || '—'}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: m.status === 'completed' ? '#166534' : '#713f12', color: '#fff' }}>
                            {m.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button onClick={() => {
                            handleEditMatchup(m);
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }} className="btn secondary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            Adjust / Override
                          </button>
                          <button onClick={() => handleDeleteMatchup(m.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {unassignedUsers.map(u => (
                    <tr key={`unassigned-${u.id}`} style={{ borderBottom: '1px solid var(--theme-border)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                      <td style={{ padding: '0.5rem' }}>
                        <strong style={{ color: '#ef4444' }}>{formatCommanderWithDiscord(u)}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--theme-accent)' }}>[{u.army_faction || 'No Faction'}]</span>
                      </td>
                      <td style={{ padding: '0.5rem', fontStyle: 'italic', color: '#ef4444' }}>
                        — Unassigned / Left Out —
                      </td>
                      <td style={{ padding: '0.5rem', color: '#f87171' }}>Undeployed</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--theme-fg-muted)' }}>— : —</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--theme-fg-muted)' }}>—</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#991b1b', color: '#fff', fontWeight: 'bold' }}>
                          UNASSIGNED
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <button onClick={() => {
                          setManualP1(u.id);
                          const pairingSection = document.getElementById('manual-narrative-pairing-section');
                          if (pairingSection) pairingSection.scrollIntoView({ behavior: 'smooth' });
                        }} className="btn secondary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderColor: '#ef4444', color: '#ef4444' }}>
                          Pair Manually ↓
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

            {/* ========================================= */}
      {/*           REGISTRIES & LOGS             */}
      {/* ========================================= */}
{/* ── MUNITORUM FIELD MANUAL (UNIT POINTS) ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Munitorum Field Manual (Unit Points Registry)</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1.5rem' }}>
          Define the standard point costs for units. These auto-fill in player rosters when units are selected.
        </p>

        {upMessage && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
            {upMessage}
          </div>
        )}

        <form onSubmit={handleAddUnitPoint} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '2rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Faction</label>
            <select value={newUPFaction} onChange={e => { setNewUPFaction(e.target.value); setNewUPUnit(''); }} required style={{ width: '100%', padding: '0.6rem' }}>
              <option value="">Select Faction...</option>
              {ALLIANCE_ORDER.map(alliance => (
                <optgroup key={alliance} label={`── ${alliance} ──`}>
                  {GROUPED_FACTIONS[alliance].map(f => <option key={f} value={f}>{f}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Unit Name</label>
            <input type="text" placeholder="e.g. Intercessor Squad" list="admin-unit-suggestions" value={newUPUnit}
              onChange={e => setNewUPUnit(e.target.value)} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
            <datalist id="admin-unit-suggestions">
              {newUPFaction && (unitsByFaction[newUPFaction] || []).map(u => <option key={u} value={u} />)}
            </datalist>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Base Pts</label>
            <input type="number" min={0} value={newUPPoints} onChange={e => setNewUPPoints(parseInt(e.target.value) || '')}
              required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn primary">{editingUPId ? 'Save Changes' : 'Register Points'}</button>
            {editingUPId && (
              <button type="button" onClick={() => { resetUPForm(); setUPMessage(''); }} className="btn secondary">Cancel</button>
            )}
          </div>
        </form>

        {fetchingUP ? (
          <p>Syncing Field Manual with Administratum scrolls...</p>
        ) : unitPoints.length === 0 ? (
          <p style={{ color: 'var(--theme-fg-muted)' }}>No units currently registered in the database.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--theme-border)', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--theme-bg-secondary)', zIndex: 1 }}>
                <tr style={{ borderBottom: '2px solid var(--theme-border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Faction</th>
                  <th style={{ padding: '0.75rem' }}>Unit</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Points</th>
                  <th style={{ padding: '0.75rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {unitPoints.map(up => (
                  <tr key={up.id} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--theme-fg-muted)' }}>{up.faction}</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 'bold' }}>{up.unit_name}</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{up.base_points}</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                      <button onClick={() => handleEditUnitPoint(up)} style={{ background: 'none', border: 'none', color: 'var(--theme-accent)', cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.5rem' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUnitPoint(up.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CAMPAIGN VOTES ── */}
      <div className="card">
        <h2>Campaign Voting Tallies</h2>
        {fetchingVotes ? (
          <p>Decrypting anonymous voting ledgers...</p>
        ) : (
          <div>
            <p>Total Votes Securely Logged: {votes.length}</p>
            <ul style={{ marginTop: '1rem', color: 'var(--theme-fg-muted)' }}>
              {votes.map(v => (
                <li key={v.id}>Category [{v.category}] nominated: [{v.profiles?.commander_name || v.nominee_id}]</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
