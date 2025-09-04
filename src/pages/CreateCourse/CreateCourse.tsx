import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import type { CreateCourseFormData, CourseLesson } from '../../types/course';
import RichTextEditor from '../../components/common/RichTextEditor';
import LessonManager from '../../components/common/LessonManager';
import TagInput from '../../components/common/TagInput';
import { Save, Eye, Upload, AlertCircle, BookOpen, DollarSign, Users, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';