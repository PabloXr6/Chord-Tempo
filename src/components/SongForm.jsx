"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const SongForm = ({ song = null, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: song?.title || '',
      artist: song?.artist || '',
      defaultBPM: song?.defaultBPM || 120,
      timeSignature: song?.timeSignature || '4/4',
      description: song?.description || ''
    }
  });

  const timeSignature = watch('timeSignature');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (song) {
        await pb.collection('songs').update(song.id, data, { $autoCancel: false });
        toast({ title: 'Song updated successfully' });
      } else {
        await pb.collection('songs').create(data, { $autoCancel: false });
        toast({ title: 'Song created successfully' });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Song title"
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="artist">Artist *</Label>
        <Input
          id="artist"
          {...register('artist', { required: 'Artist is required' })}
          placeholder="Artist name"
        />
        {errors.artist && (
          <p className="text-sm text-destructive mt-1">{errors.artist.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="defaultBPM">Default BPM *</Label>
        <Input
          id="defaultBPM"
          type="number"
          {...register('defaultBPM', {
            required: 'BPM is required',
            min: { value: 30, message: 'BPM must be at least 30' },
            max: { value: 300, message: 'BPM must be at most 300' }
          })}
          min={30}
          max={300}
        />
        {errors.defaultBPM && (
          <p className="text-sm text-destructive mt-1">{errors.defaultBPM.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="timeSignature">Time Signature *</Label>
        <Select value={timeSignature} onValueChange={(value) => setValue('timeSignature', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2/4">2/4</SelectItem>
            <SelectItem value="3/4">3/4</SelectItem>
            <SelectItem value="4/4">4/4</SelectItem>
            <SelectItem value="5/4">5/4</SelectItem>
            <SelectItem value="6/8">6/8</SelectItem>
            <SelectItem value="7/8">7/8</SelectItem>
            <SelectItem value="12/8">12/8</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : song ? 'Update Song' : 'Create Song'}
        </Button>
      </div>
    </form>
  );
};

export default SongForm;